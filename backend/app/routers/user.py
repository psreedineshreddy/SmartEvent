from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at
    }
@router.get("/admin-test")
def admin_test(current_user=Depends(require_role("ADMIN"))):
    return {
        "message": "Admin access granted",
        "user_id": current_user.id,
        "role": current_user.role
    }