import requests


def main():
    url = "http://127.0.0.1:8001/api/seed-demo?confirm=true"
    r = requests.post(url, timeout=30)
    r.raise_for_status()
    print(r.json())


if __name__ == "__main__":
    main()

