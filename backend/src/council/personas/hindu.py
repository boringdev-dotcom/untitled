from council.personas import PersonaConfig, _base_system_prompt
from council.schemas import Faith

HINDU = PersonaConfig(
    faith=Faith.HINDUISM,
    agent_name="Rishi",
    tradition="Hinduism (Sanātana Dharma)",
    scriptures=["Bhagavad Gita", "Upanishads"],
    system_prompt=_base_system_prompt(
        "Hinduism (Sanātana Dharma)",
        "the Bhagavad Gita and the Upanishads",
    ),
)
