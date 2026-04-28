import unittest
import requests
import time

BASE = "http://127.0.0.1:8001/api"


def login(email, password):
    r = requests.post(f"{BASE}/login", json={"email": email, "password": password}, timeout=10)
    r.raise_for_status()
    return r.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


class ReopenFlowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure server running and seed demo
        requests.post(f"{BASE}/seed-demo?confirm=true", timeout=20)
        cls.admin_token = login("admin@example.com", "password123")
        cls.op1_token = login("op1@example.com", "password123")

    def test_01_open_submit_and_reopen_visible(self):
        # Pick latest operator 1 batch from admin history
        res = requests.get(
            f"{BASE}/admin/auto-submit-history?filter_type=all&sort=desc&page=1&limit=20",
            headers=auth_headers(self.admin_token),
            timeout=10,
        )
        res.raise_for_status()
        data = res.json()["data"]
        # Find first batch for Operator Satu
        target = None
        for row in data:
            if row["operator_name"] == "Operator Satu":
                target = row
                break
        self.assertIsNotNone(target, "Operator Satu batch not found in history")

        operator_id = target["operator_id"]

        # Get count before reopen (as operator)
        before_drafts = requests.get(
            f"{BASE}/entries?status=DRAFT",
            headers=auth_headers(self.op1_token),
            timeout=10,
        ).json()
        before_reopen = [d for d in before_drafts if int(d.get("reopened_by_admin") or 0) == 1]

        # Open submit
        r = requests.post(
            f"{BASE}/admin/open-submit",
            json={"operator_id": operator_id, "submitted_at": target["timestamp"]},
            headers=auth_headers(self.admin_token),
            timeout=10,
        )
        r.raise_for_status()

        # Verify reopened drafts appear for operator
        drafts = requests.get(
            f"{BASE}/entries?status=DRAFT",
            headers=auth_headers(self.op1_token),
            timeout=10,
        )
        drafts.raise_for_status()
        reopened_list = [d for d in drafts.json() if int(d.get("reopened_by_admin") or 0) == 1]
        self.assertGreater(len(reopened_list), len(before_reopen))

        # Ensure records not deleted (count all entries remains > 0)
        all_entries = requests.get(
            f"{BASE}/entries",
            headers=auth_headers(self.op1_token),
            timeout=10,
        ).json()
        self.assertGreater(len(all_entries), 0)

    def test_02_manual_submit_restores_status(self):
        # Submit all REOPENED
        r = requests.post(
            f"{BASE}/entries/manual-submit",
            json={"type": "REOPENED"},
            headers=auth_headers(self.op1_token),
            timeout=10,
        )
        r.raise_for_status()
        rows = r.json()["rows"]
        self.assertGreater(rows, 0)

        # Confirm no reopened drafts remains
        drafts = requests.get(
            f"{BASE}/entries?status=DRAFT",
            headers=auth_headers(self.op1_token),
            timeout=10,
        ).json()
        reopened = [d for d in drafts if int(d.get("reopened_by_admin") or 0) == 1]
        self.assertEqual(len(reopened), 0)


if __name__ == "__main__":
    unittest.main()
