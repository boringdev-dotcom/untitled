from council.personas import PersonaConfig, _base_system_prompt
from council.schemas import Faith

ISLAM = PersonaConfig(
    faith=Faith.ISLAM,
    agent_name="Sheikh",
    tradition="Islam",
    scriptures=["Quran"],
    system_prompt=_base_system_prompt(
        "Islam",
        "the Holy Quran",
    ),
)
