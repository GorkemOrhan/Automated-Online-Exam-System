# Import models to make them available when importing the models package
from app.models.user import User
from app.models.exam import Exam
from app.models.question import Question, Option
from app.models.candidate import Candidate
from app.models.result import Result, Answer 