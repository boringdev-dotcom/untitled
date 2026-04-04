from council.personas import PersonaConfig, _base_system_prompt
from council.schemas import Faith

CHRISTIAN = PersonaConfig(
    faith=Faith.CHRISTIANITY,
    agent_name="Father Thomas",
    tradition="Christianity",
    scriptures=["Bible (King James Version)"],
    system_prompt=_base_system_prompt(
        "Christianity",
        "the Holy Bible (King James Version)",
    ),
)
