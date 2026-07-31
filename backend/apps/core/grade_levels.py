MIN_GRADE_LEVEL = 1
MAX_GRADE_LEVEL = 12

GRADE_LEVEL_RANGE_MSG = (
    f'Grade level must be between {MIN_GRADE_LEVEL} and {MAX_GRADE_LEVEL}.'
)


def is_valid_grade_level(value):
    if value is None:
        return False
    try:
        grade = int(value)
    except (TypeError, ValueError):
        return False
    return MIN_GRADE_LEVEL <= grade <= MAX_GRADE_LEVEL
