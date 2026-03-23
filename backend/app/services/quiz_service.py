"""
quiz_service.py
---------------
Business logic for quiz generation and grading.
"""

import os
from app.utils.file_handler import read_json, write_json
from app.utils.helpers import generate_id, get_timestamp
from app.services.ai_service import generate_quiz_questions
from config import Config

# Path to the quizzes data file
QUIZZES_FILE = os.path.join(Config.DATA_DIR, "quizzes.json")


def create_quiz(topic, num_questions=5):
    """
    Generate a new quiz on a given topic.

    Args:
        topic (str): The topic for the quiz.
        num_questions (int): Number of questions to generate.

    Returns:
        dict: The newly created quiz object with questions.
    """
    # Use AI service to generate questions
    questions = generate_quiz_questions(topic, num_questions)

    # Add unique IDs to each question
    for i, q in enumerate(questions):
        q["id"] = f"q{i + 1}"

    quiz = {
        "id": generate_id(),
        "topic": topic.strip(),
        "questions": questions,
        "created_at": get_timestamp(),
        "score": None,  # Will be filled when graded
    }

    # Save to history
    quizzes = read_json(QUIZZES_FILE)
    quizzes.append(quiz)
    write_json(QUIZZES_FILE, quizzes)

    return quiz


def grade_quiz(quiz_id, answers):
    """
    Grade a quiz by comparing user answers to correct answers.

    Args:
        quiz_id (str): The quiz ID to grade.
        answers (dict): A dict mapping question_id -> selected_option_index.
                        Example: {"q1": 2, "q2": 0, "q3": 1}

    Returns:
        dict | None: Grading results with score and details, or None if quiz not found.
    """
    quizzes = read_json(QUIZZES_FILE)

    for quiz in quizzes:
        if quiz["id"] == quiz_id:
            total = len(quiz["questions"])
            correct = 0
            results = []

            for question in quiz["questions"]:
                q_id = question["id"]
                user_answer = answers.get(q_id)
                is_correct = user_answer == question["correct_answer"]

                if is_correct:
                    correct += 1

                results.append({
                    "question_id": q_id,
                    "question": question["question"],
                    "user_answer": user_answer,
                    "correct_answer": question["correct_answer"],
                    "is_correct": is_correct,
                })

            # Calculate score as a percentage
            score = round((correct / total) * 100) if total > 0 else 0

            # Update the quiz with the score
            quiz["score"] = score
            quiz["graded_at"] = get_timestamp()
            write_json(QUIZZES_FILE, quizzes)

            return {
                "quiz_id": quiz_id,
                "score": score,
                "correct": correct,
                "total": total,
                "results": results,
            }

    return None


def get_quiz_history():
    """
    Retrieve all past quizzes.

    Returns:
        list[dict]: A list of all quiz objects (with scores if graded).
    """
    return read_json(QUIZZES_FILE)
