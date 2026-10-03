import csv
import random
import os

# Create dataset directory if it doesn't exist
os.makedirs('ml/dataset', exist_ok=True)
os.makedirs('ml/models', exist_ok=True)

CATEGORIES = ['Technology', 'Business', 'Science', 'World', 'Health', 'Entertainment', 'Sports', 'Politics']

HEADLINE_TEMPLATES = {
    'Technology': [
        "Breakthrough in Quantum Computing Achieves Sub-Millisecond Processing",
        "Next-Gen AI Models Demonstrate Zero-Shot Reasoning Capabilities",
        "Open-Source LLMs Challenge Proprietary AI Frontiers",
        "Cybersecurity Alert: Critical Zero-Day Vulnerability Patched",
        "Silicon Innovation Pushes Microchip Density to New Limits",
        "Autonomous Robotics Redefines Logistics and Supply Chain",
        "Edge Computing Framework Accelerates Real-Time Analytics",
        "Web3 Decentralized Protocols Gain Institutional Traction"
    ],
    'Business': [
        "Global Markets Rally Following Key Central Bank Interest Rate Decisions",
        "Tech Startups See Surge in Venture Capital Funding for Q3",
        "Renewable Energy Investments Outpace Fossil Fuel Capital Expenditures",
        "E-Commerce Growth Reshapes Global Retail Real Estate",
        "Inflation Softens as Supply Chain Bottlenecks Clear Worldwide",
        "Mergers and Acquisitions Surge in Pharmaceutical Sector",
        "Corporate Earnings Surpass Wall Street Expectations",
        "Fintech Innovations Drive Cashless Adoption in Emerging Markets"
    ],
    'Science': [
        "James Webb Space Telescope Discovers Oldest Galaxy Ever Observed",
        "Crispr Gene Editing Trial Shows Promise in Treating Genetic Disorders",
        "Nuclear Fusion Reactor Achieves Net Energy Gain in Milestone Experiment",
        "Deep Sea Exploration Reveals Undiscovered Marine Ecosystems",
        "Neuroscientists Map Neural Pathways Responsible for Memory Consolidation",
        "Renewable Battery Cell Breakthrough Doubles Energy Density",
        "Climate Researchers Track Rapid Melting of Antarctic Ice Sheets",
        "Astrophysicists Detect Gravitational Wave Anomalies"
    ],
    'World': [
        "Diplomatic Summit Reaches Landmark Accord on Global Carbon Reduction",
        "International Aid Efforts Mobilize Following Regional Natural Disaster",
        "Trade Negotiations Open New Economic Corridors Between Continents",
        "Global Infrastructure Pact Signed by Over 40 Nations",
        "Peace Talks Resume to Resolve Multi-Year Border Dispute",
        "United Nations Launches Clean Water Initiative Across Rural Zones",
        "Cross-Border Renewable Energy Grid Link Completed",
        "Cultural Exchange Forum Promotes Global Educational Access"
    ],
    'Health': [
        "New mRNA Vaccine Candidate Enters Phase 3 Clinical Trials for Cancer",
        "Study Identifies Key Lifestyle Factors in Extending Healthy Lifespan",
        "Digital Health Apps Show Measurable Reduction in Patient Anxiety",
        "Breakthrough Alzheimer's Drug Receives Accelerated Regulatory Approval",
        "Nutrition Research Highlights Impact of Microbiome on Immunity",
        "Telemedicine Adoption Permanently Transforms Primary Care Delivery",
        "AI Diagnostic Tool Detects Early Stage Tumors with 98 Percent Accuracy",
        "Sleep Science Experiment Reveals Critical Phase for Brain Detoxification"
    ],
    'Entertainment': [
        "Independent Sci-Fi Film Sweeps Top Honors at International Film Festival",
        "Streaming Giant Announces Record Subscriber Growth Following Exclusive Release",
        "Music Industry Embraces AI-Assisted Spatial Audio Production",
        "Acclaimed Novel Adapted Into Box-Office Breaking Cinematic Trilogy",
        "Gaming Industry Revenue Surpasses Legacy Media Combined",
        "Virtual Reality Concert Draws Multi-Million Live Global Audience",
        "Retrospective Exhibition Celebrating Modern Art Opens to Packed Galleries",
        "Popular Animated Series Renewed for Additional Multi-Season Arc"
    ],
    'Sports': [
        "Underdog Team Secures Historic Championship Victory in Final Seconds",
        "World Record Shattered at International Track and Field Championship",
        "Next-Generation Athletic Analytics Revolutionize Player Health Training",
        "Global Soccer Tournament Draws Record Global Television Viewership",
        "Rookie Phenom Breaks Decades-Old Scoring Record in League Debut",
        "Motorsport Team Dominates Endurance Race with Hybrid Powertrain",
        "Extreme Winter Sports Event Introduces Eco-Friendly Mountain Venues",
        "Tennis Legend Announces Retirement After Final Grand Slam Appearance"
    ],
    'Politics': [
        "Legislators Pass Comprehensive Privacy and Data Protection Reform Bill",
        "Bipartisan Coalition Reaches Agreement on National Infrastructure Funding",
        "Electoral Reform Measure Passes Key Parliamentary Committee Vote",
        "Judicial Ruling Sets New Precedent for Digital Speech and Platform Regulation",
        "Urban Housing Reform Act Signed into Law to Boost Affordable Units",
        "International Security Summit Reaffirms Collective Defense Commitments",
        "Environmental Protection Agency Issues Stricter Industrial Emission Limits",
        "State Budget Proposal Prioritizes Education and Renewable Energy R&D"
    ]
}

def generate_dataset(num_samples=2500):
    random.seed(42)
    rows = []
    
    for i in range(num_samples):
        cat = random.choice(CATEGORIES)
        template = random.choice(HEADLINE_TEMPLATES[cat])
        # Add slight variation to title
        variants = ["", " [Analysis]", " [Special Report]", " - Key Takeaways", " - What You Need to Know", " - Industry Impact"]
        title = template + random.choice(variants)
        
        category_id = CATEGORIES.index(cat)
        sentiment_score = round(random.uniform(-0.8, 0.9), 3)
        readability_score = round(random.uniform(0.35, 0.95), 3)
        recency_decay = round(random.uniform(0.1, 1.0), 3)
        dwell_time_avg = round(random.uniform(1.0, 45.0), 1)
        click_through_rate = round(random.uniform(0.02, 0.35), 3)
        
        # Calculate realistic synthetic target label 'engaged' (0 or 1)
        # High engagement correlated with dwell time > 12s, high CTR, high readability, and recency
        engagement_prob = (
            (dwell_time_avg / 45.0) * 0.45 +
            (click_through_rate / 0.35) * 0.25 +
            recency_decay * 0.15 +
            readability_score * 0.15
        )
        engaged = 1 if (engagement_prob + random.uniform(-0.1, 0.1)) > 0.48 else 0
        
        rows.append({
            'article_id': f"art_{i+1000:04d}",
            'title': title,
            'category': cat,
            'category_id': category_id,
            'sentiment_score': sentiment_score,
            'readability_score': readability_score,
            'recency_decay': recency_decay,
            'dwell_time_avg': dwell_time_avg,
            'click_through_rate': click_through_rate,
            'engaged': engaged
        })

    filepath = os.path.join('ml', 'dataset', 'news_dataset.csv')
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Generated {num_samples} news dataset samples at {filepath}")

if __name__ == '__main__':
    generate_dataset(2500)
