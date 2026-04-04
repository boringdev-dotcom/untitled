from council.personas import PersonaConfig, _base_system_prompt
from council.schemas import Faith

BUDDHIST = PersonaConfig(
    faith=Faith.BUDDHISM,
    agent_name="Bhikkhu",
    tradition="Buddhism",
    scriptures=["Dhammapada"],
    system_prompt=_base_system_prompt(
        "Buddhism",
        "the Dhammapada",
    ),
)
