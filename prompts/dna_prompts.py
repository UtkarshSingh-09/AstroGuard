"""
Prompt templates for the DNA extraction agent.
Uses llama3-8b for fast, structured JSON extraction from conversation.
"""

# ─── DNA Extraction System Prompt ─────────────────────────────────────────────

DNA_SYSTEM_PROMPT = """You are AstraGuard's Financial DNA Extractor.
Your job is to extract a user's financial profile from a natural conversation.

RULES:
1. Extract ONLY information explicitly stated by the user.
2. NEVER guess, assume, or hallucinate any numbers.
3. If a field is not mentioned, set it to null.
4. Return ONLY valid JSON. No explanation, no markdown, no extra text.
5. Ask no questions. Your only job is to return the extracted JSON variables.

JSON SCHEMA TO FILL:
{schema}

COMPLETION RULES:
- MINIMUM required fields for "complete": age, annual_salary, monthly_expenses, at least 1 goal
- Behavioral DNA needs: panic_threshold OR last_panic_event OR behavior description
- Track completion_percentage based on filled fields out of total expected fields
"""

# ─── DNA Extraction User Prompt ───────────────────────────────────────────────

DNA_EXTRACTION_PROMPT = """Conversation so far:
{conversation_history}

Based on this conversation, extract all financial information into the JSON schema.
Also determine:
1. completion_percentage (0-100): how much of the profile is filled
2. status: "gathering" if still missing info, "complete" if all minimum fields filled

Return this exact JSON structure:
{{
    "status": "<gathering|complete>",
    "completion_percentage": <0-100>,
    "financial_dna": {{
        "age": <int|null>,
        "annual_salary": <float|null>,
        "monthly_expenses": <float|null>,
        "existing_investments": {{
            "mutual_funds": <float|0>,
            "ppf": <float|0>,
            "fd": <float|0>,
            "stocks": <float|0>,
            "epf": <float|0>,
            "nps": <float|0>
        }},
        "goals": [
            {{
                "name": "<string>",
                "target_amount": <float|null>,
                "target_year": <int|null>,
                "emotional_label": "<string|null>"
            }}
        ],
        "insurance_cover": <float|null>,
        "risk_profile": "<conservative|moderate|aggressive|null>",
        "city_type": "<metro|non-metro|null>",
        "rent_paid_monthly": <float|null>,
        "hra_received": <float|null>,
        "has_home_loan": <bool>,
        "home_loan_interest_annual": <float|null>
    }},
    "behavioral_dna": {{
        "panic_threshold": <float|null>,
        "behavior_type": "<panic_prone|disciplined|impulsive|passive|null>",
        "last_panic_event": "<string|null>",
        "action_rate": <float|null>,
        "recovery_awareness": "<LOW|MEDIUM|HIGH|null>"
    }}
}}
"""

# ─── Question Flow (ordered by priority) ─────────────────────────────────────

QUESTION_FLOW = [
    # Basic profile
    "Let's get started! First, could you tell me your current age?",
    "And what is your current annual salary? (If you uploaded your Form 16, I'll extract this automatically).",
    "Approximately how much are your total monthly expenses (Rent, groceries, EMIs)?",
    "What is your primary financial goal right now? (e.g., Retirement, Buying a house, Building an emergency fund)",
    # Investments (Grouped)
    "Great! Do you have any existing investments like Mutual Funds, PPF, FDs, or Stocks? If not, we can move on.",
    # Insurance
    "Just one more thing — do you have any active Life Insurance (Term plan) or Health Insurance coverage? If so, what is the cover amount?",
    # Behavioral (the differentiator)
    "Last question: During major market crashes (like March 2020), do you tend to panic sell, stop your SIPs, or continue investing?",
]

# ─── Behavioral Seeding Questions ─────────────────────────────────────────────

BEHAVIORAL_QUESTIONS = [
    {
        "question": "Ek cheez bata — jab market girta hai, tu kitni baar portfolio check karta hai? Din mein ek baar? Har ghante? Ya ignore karta hai?",
        "extracts": "panic_portfolio_checks",
    },
    {
        "question": "Pichle 1 saal mein SIP miss ya pause kiya hai kabhi?",
        "extracts": "sip_pauses_last_12m",
    },
    {
        "question": "Jab market recovery hota hai crash ke baad — tujhe lagta hai market wapas aayega ya nahi?",
        "extracts": "recovery_awareness",
    },
]
