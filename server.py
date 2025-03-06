from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Allow requests from any frontend

# Path to SQLite database
DB_PATH = "bible_tracker.db"

def get_verse(book_name, chapter, verse):
    """ Fetch verse text from the database using book name, chapter, and verse. """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get the book_id from the books table
    cursor.execute("SELECT id FROM books WHERE name = ?", (book_name,))
    book = cursor.fetchone()

    if not book:
        conn.close()
        return None  # Book not found

    book_id = book[0]

    # Get the verse text using book_id, chapter, and verse
    cursor.execute("""
        SELECT verse_text FROM verses
        WHERE book_id = ? AND chapter_number = ? AND verse_number = ?
    """, (book_id, chapter, verse))

    result = cursor.fetchone()
    conn.close()

    return result[0] if result else None

@app.route('/verse', methods=['GET'])
def fetch_verse():
    """ API Endpoint: Get a verse by book, chapter, and verse number """
    book = request.args.get('book')
    chapter = request.args.get('chapter')
    verse = request.args.get('verse')

    if not book or not chapter or not verse:
        return jsonify({"error": "Missing parameters"}), 400

    verse_text = get_verse(book, int(chapter), int(verse))

    if verse_text:
        return jsonify({
            "book": book,
            "chapter": chapter,
            "verse": verse,
            "text": verse_text,
            "credit": "New World Translation (NWT) - JW.org"
        })
    else:
        return jsonify({"error": "Verse not found"}), 404

# ✅ Required for Gunicorn on Render
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
