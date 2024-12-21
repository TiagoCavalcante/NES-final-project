import json
import os
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
  JWTManager,
  create_access_token,
  get_jwt_identity,
  jwt_required,
)
from passlib.hash import bcrypt

app = Flask(__name__)
CORS(app)

# Use environment variable for JWT key; fallback to a default for dev/test
app.config["JWT_SECRET_KEY"] = os.environ.get(
  "JWT_SECRET_KEY", "DEV_UNSAFE_KEY"
)
jwt = JWTManager(app)


def init_db():
  conn = sqlite3.connect("database.db")
  cursor = conn.cursor()

  cursor.execute(
    """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """
  )

  # Create user_schools table if not exists
  # We'll store the JSON-encoded list and a last_modified timestamp
  cursor.execute(
    """
        CREATE TABLE IF NOT EXISTS user_schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            school_list TEXT NOT NULL,
            last_modified TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """
  )

  conn.commit()
  conn.close()


init_db()


@app.route("/api/register", methods=["POST"])
def register():
  data = request.json
  username = data.get("username")
  password = data.get("password")
  if not username or not password:
    return jsonify(
      {"error": "Username and password required"}
    ), 400

  password_hash = bcrypt.hash(password)

  try:
    conn = sqlite3.connect("mydb.db")
    cursor = conn.cursor()
    cursor.execute(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      (username, password_hash),
    )
    conn.commit()
  except sqlite3.IntegrityError:
    return jsonify(
      {"error": "Username already exists"}
    ), 400
  finally:
    conn.close()

  return jsonify(
    {"message": "User registered successfully"}
  ), 201


@app.route("/api/login", methods=["POST"])
def login():
  data = request.json
  username = data.get("username")
  password = data.get("password")

  if not username or not password:
    return jsonify(
      {"error": "Username and password required"}
    ), 400

  # Lookup user
  conn = sqlite3.connect("mydb.db")
  cursor = conn.cursor()
  cursor.execute(
    "SELECT id, username, password_hash FROM users WHERE username = ?",
    (username,),
  )
  row = cursor.fetchone()
  conn.close()

  if row is None:
    return jsonify(
      {"error": "Invalid username or password"}
    ), 401

  user_id, user_name, password_hash = row

  if not bcrypt.verify(password, password_hash):
    return jsonify(
      {"error": "Invalid username or password"}
    ), 401

  # Create JWT
  access_token = create_access_token(
    identity=user_name
  )
  return jsonify(
    {
      "message": "Login successful",
      "access_token": access_token,
    }
  ), 200


@app.route("/api/schools", methods=["GET"])
@jwt_required()
def get_schools():
  # Identify user
  current_username = get_jwt_identity()

  # Lookup user_id
  conn = sqlite3.connect("mydb.db")
  cursor = conn.cursor()
  cursor.execute(
    "SELECT id FROM users WHERE username = ?",
    (current_username,),
  )
  user_row = cursor.fetchone()
  if user_row is None:
    conn.close()
    return jsonify(
      {"error": "User not found"}
    ), 404

  user_id = user_row[0]
  cursor.execute(
    "SELECT school_list, last_modified FROM user_schools WHERE user_id = ?",
    (user_id,),
  )
  row = cursor.fetchone()
  conn.close()

  if row is None:
    # If user has never stored a school list, return default
    return jsonify(
      {"school_list": [], "last_modified": None}
    ), 200
  else:
    school_list_str, last_modified = row
    # parse the JSON string
    school_list = json.loads(school_list_str)
    return jsonify(
      {
        "school_list": school_list,
        "last_modified": last_modified,
      }
    ), 200


@app.route("/api/schools", methods=["PUT"])
@jwt_required()
def update_schools():
  data = request.json
  new_school_list = data.get("school_list")
  new_last_modified = data.get("last_modified")
  if (
    new_school_list is None
    or new_last_modified is None
  ):
    return jsonify(
      {
        "error": "school_list and last_modified required"
      }
    ), 400

  current_username = get_jwt_identity()

  # Lookup user_id
  conn = sqlite3.connect("mydb.db")
  cursor = conn.cursor()
  cursor.execute(
    "SELECT id FROM users WHERE username = ?",
    (current_username,),
  )
  user_row = cursor.fetchone()

  if user_row is None:
    conn.close()
    return jsonify(
      {"error": "User not found"}
    ), 404

  user_id = user_row[0]

  cursor.execute(
    "SELECT id FROM user_schools WHERE user_id = ?",
    (user_id,),
  )
  row = cursor.fetchone()

  school_list_json = json.dumps(
    new_school_list
  )  # store as JSON

  if row is None:
    # Insert new row
    cursor.execute(
      """
            INSERT INTO user_schools (user_id, school_list, last_modified)
            VALUES (?, ?, ?)
        """,
      (
        user_id,
        school_list_json,
        new_last_modified,
      ),
    )
  else:
    # Update existing
    cursor.execute(
      """
            UPDATE user_schools
            SET school_list = ?, last_modified = ?
            WHERE user_id = ?
        """,
      (
        school_list_json,
        new_last_modified,
        user_id,
      ),
    )

  conn.commit()
  conn.close()

  return jsonify(
    {
      "message": "Schools list updated successfully"
    }
  ), 200


if __name__ == "__main__":
  app.run(debug=True)
