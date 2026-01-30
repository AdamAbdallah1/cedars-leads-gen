from flask import Flask, request, Response
from flask_cors import CORS
import requests
import time
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

API_KEY = "AIzaSyC_O6j2914xdG8etm-kSk4Od0_YF2SIum4"

CATEGORIES = {
    "Medical & Clinics": ["private medical clinic {city}", "specialist doctor clinic {city}", "dental clinic {city}", "pediatrician {city}", "diagnostic center {city}"],
    "Law & Consulting": ["law office {city}", "legal consultancy {city}", "corporate lawyer {city}", "notary public {city}", "tax attorney {city}"],
    "Real Estate & Construction": ["real estate brokerage {city}", "architecture office {city}", "construction company {city}", "interior design studio {city}", "property management {city}"],
    "Finance & Accounting": ["accounting firm {city}", "tax consultancy {city}", "audit firm {city}", "wealth management {city}", "insurance broker {city}"],
    "Education & Training": ["private school {city}", "training center {city}", "language institute {city}", "music school {city}", "vocational college {city}"],
    "Marketing & Media": ["digital marketing agency {city}", "advertising agency {city}", "branding consultancy {city}", "video production studio {city}", "pension media {city}"],
    "Beauty & Wellness": ["beauty salon {city}", "spa {city}", "fitness center {city}", "yoga studio {city}", "hair transplant clinic {city}"],
    "IT & Software": ["software development {city}", "web development {city}", "tech startup {city}", "cybersecurity firm {city}", "it support services {city}"],
    "Logistics & Transport": ["logistics company {city}", "freight forwarder {city}", "courier service {city}", "warehouse facility {city}", "moving company {city}"],
    "Hospitality & Food": ["boutique hotel {city}", "catering service {city}", "fine dining restaurant {city}", "event planner {city}", "pastry shop {city}"],
    "Retail & Showrooms": ["luxury furniture showroom {city}", "clothing boutique {city}", "jewelry store {city}", "electronics retailer {city}", "optical shop {city}"],
    "Automotive": ["car dealership {city}", "auto repair shop {city}", "car rental agency {city}", "tire center {city}", "detailing studio {city}"]
}

session = requests.Session()

def get_places(query, page_token=None):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": API_KEY}
    if page_token:
        params["pagetoken"] = page_token
        time.sleep(2)
    try:
        r = session.get(url, params=params, timeout=15)
        data = r.json()
        return data.get("results", []), data.get("next_page_token")
    except: return [], None

def get_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {"place_id": place_id, "fields": "name,formatted_phone_number,website,formatted_address,url", "key": API_KEY}
    try:
        r = session.get(url, params=params, timeout=15)
        return r.json().get("result", {})
    except: return {}

@app.route("/generate-stream", methods=["POST"])
def generate_stream():
    data = request.json
    category = data.get("category")
    city = data.get("city")
    if not city or category not in CATEGORIES:
        return {"error": "Invalid input"}, 400

    queries = [q.format(city=city) for q in CATEGORIES[category]]
    seen_ids = set()

    def stream():
        total_queries = len(queries)
        for idx, query in enumerate(queries):
            page_token = None
            while True:
                places, next_page = get_places(query, page_token)
                for place in places:
                    pid = place.get("place_id")
                    if pid in seen_ids: continue
                    seen_ids.add(pid)
                    details = get_place_details(pid)
                    if details.get("formatted_phone_number"):
                        lead = {
                            "Category": category,
                            "Name": details.get("name"),
                            "Phone": details.get("formatted_phone_number"),
                            "Website": details.get("website"),
                            "Address": details.get("formatted_address"),
                            "Maps": details.get("url")
                        }
                        yield json.dumps({"type": "lead", "data": lead}) + "\n"
                if not next_page: break
                page_token = next_page
            yield json.dumps({"type": "progress", "data": int(((idx + 1) / total_queries) * 100)}) + "\n"
    return Response(stream(), mimetype="text/plain")

if __name__ == "__main__":
    app.run(debug=True, port=5000)