
import uuid


def generate_transaction_id() -> str:
    """Generate a unique reference for a simulated payment."""
    return f"SIM-{uuid.uuid4().hex.upper()}"


def simulate_payment(
    amount: float,
    simulate_failure: bool = False
) -> tuple[bool, str]:
    """Simulate payment for development; no real money is charged."""
    if amount <= 0:
        return False, "Payment amount must be greater than zero"

    if simulate_failure:
        return False, "Simulated payment failure"

    return True, "Payment successful"


