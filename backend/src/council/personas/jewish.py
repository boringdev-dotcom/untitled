from council.personas import PersonaConfig, _base_system_prompt
from council.schemas import Faith

JEWISH = PersonaConfig(
    faith=Faith.JUDAISM,
    agent_name="Rabbi",
    tradition="Judaism",
    scriptures=["Torah", "Tanakh"],
    system_prompt=_base_system_prompt(
        "Judaism",
        "the Torah and the Tanakh",
    ),
)
