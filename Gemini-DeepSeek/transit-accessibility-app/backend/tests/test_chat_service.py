import os
import pytest
from unittest.mock import MagicMock
from chat_service import ChatService

class _FakeResponse:
    def __init__(self, text: str):
        self.text = text

class _FakeModels:
    def __init__(self, text: str):
        self._text = text
        self.last_call = None

    def generate_content(self, model=None, contents=None, config=None):
        self.last_call = {"model": model, "contents": contents, "config": config}
        return _FakeResponse(self._text)

class _FakeClient:
    def __init__(self, text: str):
        self.models = _FakeModels(text)

# Test 1: If the user's speech-to-text is empty, the interpreter returns an empty string
#   The interpreter should not try to guess a location
def test_interpreter_empty_returns_empty():
    s = ChatService()
    s._client = None  # force fallback path
    out = s.interpret_destination("")
    assert out == ""

# Test 2: If Gemini is unavailable, the heuristic cleaner is used. Also, ensures the heuristic cleaner doesn't default to one response
def test_interpreter_fallback_reflects_input():
    s = ChatService()
    s._client = None

    out = s.interpret_destination("metrotown")
    assert "metrotown" in out.lower()
    assert "union station" not in out.lower()

# Test 3: When Gemini returns a valid JSON with a destination, the interpreter parses it and returns it correctly
def test_interpreter_uses_gemini_json_when_available():
    """
    If Gemini returns JSON, interpret_destination should return destination.
    """
    s = ChatService()
    s._client = _FakeClient('{"destination":"Union Station","confidence":0.92,"notes":"best match"}')

    out = s.interpret_destination("Un... un... onion... sta... shun.")
    assert out == "Union Station"

# Test 4: Ensures _safe_parse_json() properly parses in strange syntax in responses from Gemini
def test_interpreter_parses_json_in_code_fences():
    """
    _safe_parse_json strips ```json fences; this ensures it works.
    """
    s = ChatService()
    s._client = _FakeClient('```json\n{"destination":"Waterfront Station","confidence":0.8,"notes":""}\n```')

    out = s.interpret_destination("wa... wa... ter... front")
    assert out == "Waterfront Station"

# Test 5: If Gemini provides a message that isn't in JSON form, the destination can still be recovered
def test_interpreter_extracts_destination_when_not_json():
    """
    If Gemini doesn't return JSON, _extract_destination_from_text should recover.
    """
    s = ChatService()
    s._client = _FakeClient("Destination: Commercial-Broadway Station")

    out = s.interpret_destination("com... mer... shul... broad... way")
    assert out == "Commercial-Broadway Station"

# Test 6: If Gemini is unavailable, the simple fallback is used that still provides the correct information
def test_synthesizer_fallback_includes_transit_climate_and_ramp():
    s = ChatService()
    s._client = None  # fallback

    transit = "Bus 504, 15 mins"
    climate = "0.4kg CO2 saved"
    vision = "Ramp Detected: True"

    out = s.get_chat_response(transit, climate, vision)

    assert "504" in out
    assert "15" in out
    assert "0.4" in out
    assert "co2" in out.lower()
    assert ("ramp" in out.lower()) or ("wheelchair" in out.lower())

# Test 7: When Gemini is available, the synthesizer does use it instead of the fallback
def test_synthesizer_uses_gemini_text_when_available():
    s = ChatService()
    s._client = _FakeClient("Great news! The 504 arrives in 15 minutes and has a wheelchair ramp available.")

    out = s.get_chat_response("Bus 504, 15 mins", "0.4kg CO2 saved", "Ramp Detected: True")
    assert out.startswith("Great news!")
    assert "wheelchair" in out.lower()

# Test 8: When Gemini is available, the synthesizer makes a call to Gemini
def test_synthesizer_calls_gemini_when_client_present():
    s = ChatService()

    # Spy client (no real network)
    s._client = MagicMock()
    s._client.models.generate_content = MagicMock(return_value=_FakeResponse("ok"))

    out = s.synthesize("Bus 504, 15 mins", "0.4kg CO2 saved", "Ramp Detected: True")

    assert out == "ok"
    s._client.models.generate_content.assert_called_once()

    # Verify key args are passed (model + thinking level)
    _, kwargs = s._client.models.generate_content.call_args
    assert kwargs["model"] == s.model_id
    assert kwargs["config"]["thinking_config"]["thinking_level"] == "low"

# Test 9: When Gemini is available, the interpreter makes a call to Gemini
def test_interpreter_calls_gemini_and_parses_json():
    s = ChatService()

    s._client = MagicMock()
    s._client.models.generate_content = MagicMock(
        return_value=_FakeResponse('{"destination":"Union Station","confidence":0.9,"notes":""}')
    )

    out = s.interpret_destination("Un... un... onion... sta... shun.")

    assert out == "Union Station"
    s._client.models.generate_content.assert_called_once()

# For the following 2 tests, do not run them if offline/want a faster reponse since they make a call to Gemini and the reponse is analyzed
# Test 10: Tests that the Gemini call for the synthesizer is reasonable
def test_live_synthesizer_reasonable():
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("No GEMINI_API_KEY set. Create a .env file (copy from .env.example).")

    s = ChatService()
    out = s.synthesize("Bus 504, 15 mins", "0.4kg CO2 saved", "Ramp Detected: True")

    assert out.strip()
    assert "504" in out
    assert "15" in out
    assert ("ramp" in out.lower()) or ("wheelchair" in out.lower())

# Test 11: Tests that the Gemini call for the interpreter is reasonable
def test_live_interpreter_reasonable():
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("No GEMINI_API_KEY set. Create a .env file (copy from .env.example).")

    s = ChatService()
    out = s.interpret_destination("Un... un... onion... sta... shun.")

    assert out.strip()
    assert len(out) < 80
    assert not out.strip().startswith("{")