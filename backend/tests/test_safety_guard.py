from app.services.safety_guard import DISCLAIMER, assess_emergency, enforce_response_boundaries


def test_detects_chest_pain() -> None:
    assessment = assess_emergency("I have crushing chest pain right now")
    assert assessment.is_emergency
    assert "possible heart emergency" in assessment.reasons


def test_detects_self_harm_language() -> None:
    assert assess_emergency("I am thinking about killing myself").is_emergency


def test_does_not_flag_general_question() -> None:
    assert not assess_emergency("What are common causes of a mild headache?").is_emergency


def test_appends_disclaimer_once() -> None:
    response = enforce_response_boundaries("General information.")
    assert response.endswith(DISCLAIMER)
    assert response.count(DISCLAIMER) == 1
