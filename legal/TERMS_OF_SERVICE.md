# TERMS OF SERVICE

**Avion Aviation Command Console**

**Version 1.0**  
**Effective Date: November 17, 2025**  
**Last Updated: November 17, 2025**

---

## IMPORTANT AVIATION SAFETY NOTICE

**READ CAREFULLY BEFORE USING THIS SERVICE**

Avion is a **flight management and operations planning tool** designed for flight department personnel, dispatchers, schedulers, and aviation managers. **THIS SERVICE IS NOT CERTIFIED FOR NAVIGATION OR PRIMARY FLIGHT OPERATIONS.**

**INTENDED USERS:**
- Flight department managers and operations staff
- Flight dispatchers and schedulers
- Aviation operations coordinators
- Ground-based flight planning personnel

**NOT INTENDED FOR:**
- In-flight use by pilots as primary navigation or decision-making tool
- Direct cockpit use during flight operations
- Real-time operational decision-making without verification

By using Avion, you acknowledge and agree that:

- This is a ground-based planning and management tool
- Pilots-in-Command (PICs) retain sole responsibility for all flight decisions
- This software does not replace official aviation publications, NOTAMs, or ATC clearances
- All flight-critical information must be verified with authoritative sources before flight operations
- AI-generated content may contain errors and requires independent verification
- Information provided is for planning purposes and must be communicated to flight crews through proper operational channels

**IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SERVICE.**

---

## 1. ACCEPTANCE OF TERMS

These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Avion ("we," "us," "our," or "Service") governing your access to and use of the Avion platform, including all software, applications, websites, APIs, and related services (collectively, the "Service").

By creating an account, accessing the Service, or using any features of Avion, you represent that:

1. You are at least 18 years of age or have reached the age of majority in your jurisdiction
2. You have the legal capacity to enter into binding contracts
3. You have read, understood, and agree to be bound by these Terms
4. You comply with all applicable aviation regulations in your jurisdiction
5. You understand the limitations and disclaimers contained herein

## 2. AVIATION REGULATORY COMPLIANCE

### 2.1 Flight Management and PIC Responsibility Under 14 CFR § 91.103 and § 91.3

**United States (FAA):** Under Title 14 of the Code of Federal Regulations (14 CFR):

- **§ 91.103 (Preflight Action):** Each pilot-in-command shall, before beginning a flight, become familiar with all available information concerning that flight. Avion provides informational data to assist flight operations personnel and dispatchers in preparing flight information, but does not replace the pilot's independent responsibility to review all available information. **Flight managers and dispatchers must communicate all relevant information to pilots through proper operational procedures.**

- **§ 91.3 (Responsibility and Authority of the Pilot in Command):** The pilot-in-command is directly responsible for, and is the final authority as to, the operation of that aircraft. Avion's recommendations, risk assessments, and AI-generated suggestions are **advisory tools for flight planning and management only** and do not supersede pilot authority or judgment. **All operational decisions remain with the pilot-in-command.**

### 2.2 Part 135 Operators

If you are operating under 14 CFR Part 135 (Commuter and On-Demand Operations), you acknowledge that:

- Avion does not replace FAA-approved dispatch or flight release procedures
- Flight release requirements under §§ 135.181, 135.203–135.223 remain your responsibility
- Weather minimums, alternate requirements, and fuel calculations must be verified independently
- This Service does not constitute an FAA-approved operational control system

### 2.3 EASA and International Users

**European Union (EASA):** Users subject to European Union Aviation Safety Agency (EASA) regulations acknowledge that:

- This Service is not certified under Part-IS (Information Security) as an Aeronautical Information Service (AIS) provider
- Users must comply with Commission Implementing Regulation (EU) 2015/1018 regarding AIS data
- ICAO Annex 15 standards for aeronautical information must be verified through official sources

**International Users:** If you operate under the civil aviation authority of any country other than the United States, you agree to:

- Comply with your jurisdiction's equivalent of pilot-in-command responsibility
- Verify all data against your national AIS, meteorological service, and NOTAMs
- Acknowledge that Avion is not certified under your local aviation authority

### 2.4 Advisory Circular AC 120-76E (Electronic Flight Bags)

Avion may be used as a Type A or Type B Electronic Flight Bag (EFB) application under FAA Advisory Circular AC 120-76E guidelines. Users acknowledge:

- Avion is a non-installed software application
- Training on use of this software is recommended per AC 120-76E Section 5
- Data integrity, reliability, and currency remain the user's responsibility
- Avion does not replace required cockpit instruments or certified avionics

## 3. SERVICE DESCRIPTION AND LIMITATIONS

### 3.1 Features and Functionality

Avion provides the following informational services:

- **Flight Planning:** Route, aircraft, crew, and manifest management
- **Weather Intelligence:** METAR, TAF, and weather briefings via third-party APIs
- **Airport Database:** Airport information from OurAirports and AirportDB APIs
- **AI Assistant:** Conversational AI powered by Google Gemini for aviation queries
- **Crew Duty Calculators:** Regulatory duty time estimates (FAA Part 135, EASA, CASA, Transport Canada, UK CAA)
- **Compliance Tools:** Country-specific regulatory references and documentation checklists
- **Risk Assessment:** Automated weather risk scoring and operational recommendations
- **Real-Time Data:** Flight tracking, airport conditions, and operational intelligence

### 3.2 Service Availability

We strive to provide reliable access to the Service but do not guarantee:

- Uninterrupted or error-free operation
- Availability of third-party data sources (weather APIs, airport databases)
- Real-time accuracy of dynamic data (weather, NOTAMs, airport status)
- Compatibility with all devices, browsers, or operating systems

We reserve the right to:

- Modify, suspend, or discontinue any feature at any time without notice
- Perform scheduled or emergency maintenance
- Limit access to certain features based on subscription tier or account status

### 3.3 Data Sources and Third-Party Dependencies

Avion aggregates data from multiple third-party sources, including but not limited to:

- **Weather Data:** Aviation Weather Center (AWC), NOAA, CheckWX, private weather APIs
- **Airport Information:** OurAirports (community-maintained), AirportDB API
- **AI Services:** Google Gemini (Vertex AI and Generative AI API)
- **Authentication and Database:** Supabase (PostgreSQL, authentication services)
- **Mapping:** MapLibre GL JS for map visualizations

**YOU ACKNOWLEDGE THAT:**

- Third-party data may be incomplete, inaccurate, outdated, or unavailable
- Avion does not control third-party services and disclaims liability for their failures
- You must verify all safety-critical information with authoritative sources
- Outages or errors in third-party services may affect Avion functionality

## 4. ARTIFICIAL INTELLIGENCE AND AUTOMATED RECOMMENDATIONS

### 4.1 AI-Generated Content Disclaimer

Avion uses large language models (LLMs), including Google Gemini, to provide conversational assistance, weather briefings, and operational recommendations. **AI-generated content is informational only and may contain errors, hallucinations, or inaccuracies.**

You acknowledge and agree that:

- AI responses are probabilistic and not deterministic
- AI may misinterpret queries or provide incorrect information
- AI does not replace human judgment or professional expertise
- All AI-generated recommendations must be independently verified
- Avion is not liable for decisions made based on AI outputs

### 4.2 Weather Risk Scoring

Avion's automated weather risk engine (`lib/weather/riskEngine.ts`) analyzes METAR, TAF, and forecast data to generate risk scores (Low, Moderate, High). **Risk scores are guidance only and do not constitute operational decisions.**

You acknowledge:

- Risk algorithms are proprietary and subject to change
- Risk assessments may not account for all operational factors
- Weather conditions can change rapidly and may not be reflected in cached data
- You must conduct independent weather analysis per 14 CFR § 91.103

### 4.3 Crew Duty Calculations

Avion provides crew duty time calculators for FAA Part 135, EASA FTL, CASA, Transport Canada, and UK CAA regulations. **Calculations are estimates based on user-provided inputs and simplified regulatory interpretations.**

You acknowledge:

- Calculators are educational tools, not legal or professional advice
- Regulatory compliance is complex and may involve exceptions or special provisions
- Operators must verify compliance with applicable regulations and OpSpecs
- Avion is not liable for duty time violations or regulatory penalties

### 4.4 Tool-Calling and Automation

Avion's AI assistant can execute tool calls to fetch weather, search airports, and retrieve flight data. You acknowledge:

- Automated actions may produce unexpected results
- Tool execution depends on third-party API availability
- You are responsible for reviewing tool outputs before relying on them

## 5. USER ACCOUNTS AND RESPONSIBILITIES

### 5.1 Account Registration

To use Avion, you must:

- Provide accurate, complete, and current registration information
- Maintain the security and confidentiality of your login credentials
- Notify us immediately of any unauthorized access or security breach
- Accept responsibility for all activity under your account

### 5.2 Prohibited Uses

You agree NOT to:

- Use Avion for illegal, fraudulent, or unauthorized purposes
- Redistribute, resell, or sublicense access to the Service
- Reverse engineer, decompile, or extract source code
- Upload malicious code, viruses, or harmful content
- Violate any aviation regulations or safety standards
- Interfere with Service operation or other users' access
- Scrape, harvest, or collect data via automated means without permission
- Impersonate other users or provide false identity information

### 5.3 Commercial and Professional Use

Avion is intended for use by:

- **Flight departments** for operations planning and management
- **Part 91 and Part 135 operators** for ground-based dispatch and scheduling (subject to additional disclaimers)
- **Aviation management companies** for fleet coordination and oversight
- **Flight schools and training organizations** for educational and administrative purposes
- **Aviation consultants** providing management services (with appropriate professional disclaimers)

**Avion does NOT:**

- Serve as a cockpit application for in-flight pilot use
- Provide certificated aircraft maintenance tracking (not Part 145 compliant)
- Replace FAA-approved flight operations manuals or OpSpecs
- Replace certified dispatch or flight release systems
- Constitute professional aviation consulting or legal advice
- Create any attorney-client, consultant, or professional relationship

**Intended Workflow:**
Flight operations personnel use Avion for planning → Information is verified and communicated to pilots → Pilots conduct independent preflight review → Pilots make all operational decisions

## 6. INTELLECTUAL PROPERTY RIGHTS

### 6.1 Ownership

Avion, including all software, design elements (Avion Design Language), trademarks, logos, and content, is the exclusive property of Avion and its licensors. All rights not expressly granted are reserved.

### 6.2 License to Use

We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for lawful aviation purposes, subject to these Terms.

### 6.3 User-Generated Content

You retain ownership of content you upload (flight plans, notes, messages). By using the Service, you grant Avion a worldwide, royalty-free license to store, process, and display your content as necessary to provide the Service.

You represent and warrant that:

- You own or have rights to all content you upload
- Your content does not infringe third-party intellectual property
- You will not upload classified, ITAR-controlled, or export-restricted information

### 6.4 Feedback

Any suggestions, ideas, or feedback you provide to Avion become our property and may be used without compensation or attribution.

## 7. DISCLAIMER OF WARRANTIES

**TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:**

- **MERCHANTABILITY** — No warranty that the Service is suitable for any particular purpose
- **FITNESS FOR A PARTICULAR PURPOSE** — No warranty that the Service meets your operational needs
- **NON-INFRINGEMENT** — No warranty that the Service does not infringe third-party rights
- **ACCURACY** — No warranty that data, calculations, or AI outputs are accurate or complete
- **RELIABILITY** — No warranty of uninterrupted, timely, secure, or error-free operation
- **TITLE** — No warranty of clear title to third-party data sources

**WE SPECIFICALLY DISCLAIM:**

- Any warranty that weather data is current, accurate, or suitable for flight operations
- Any warranty that airport information is correct or meets operational requirements
- Any warranty that AI-generated content is reliable or free from errors
- Any warranty that crew duty calculations comply with regulatory requirements
- Any warranty that the Service will prevent accidents, incidents, or regulatory violations

**Some jurisdictions do not allow exclusion of implied warranties, so the above exclusions may not apply to you. In such jurisdictions, our liability is limited to the maximum extent permitted by law.**

## 8. LIMITATION OF LIABILITY

### 8.1 UK Unfair Contract Terms Act 1977 (UCTA) Compliance

**Nothing in these Terms excludes or limits our liability for:**

1. **Death or personal injury** caused by our negligence
2. **Fraud or fraudulent misrepresentation**
3. **Breach of statutory rights** under the Consumer Rights Act 2015 (for UK consumers)
4. **Any other liability** that cannot be excluded or limited under English law

### 8.2 Liability Cap (Business Users)

**FOR BUSINESS USERS (NON-CONSUMERS)**, and subject to Section 8.1 above, Avion's total liability for any claims arising from or related to the Service shall not exceed the greater of:

1. **£1,000 GBP**, or
2. **The amount you paid to Avion in the 12 months preceding the claim**

This limitation is subject to the **reasonableness test** under the Unfair Contract Terms Act 1977 and UK common law principles.

### 8.3 Exclusion of Consequential Damages (Business Users)

**FOR BUSINESS USERS (NON-CONSUMERS) ONLY**, and subject to Section 8.1 above, Avion shall not be liable for:

- **INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES**
- **LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES**
- **AIRCRAFT DAMAGE** (except where caused by our negligence resulting in personal injury)
- **REGULATORY FINES, PENALTIES, OR ENFORCEMENT ACTIONS**
- **THIRD-PARTY CLAIMS ARISING FROM YOUR USE OF THE SERVICE**
- **DAMAGES ARISING FROM WEATHER INACCURACIES, DATA ERRORS, OR AI MISTAKES**

**Important:** For UK consumers, the Consumer Rights Act 2015 protections in Section 8.1 always apply regardless of the above exclusions.

**This exclusion applies regardless of the legal theory (contract, tort, negligence, strict liability) and even if Avion was advised of the possibility of such damages.**

### 8.4 Force Majeure

Avion is not liable for delays, failures, or damages caused by events beyond our reasonable control, including but not limited to:

- Acts of God, natural disasters, severe weather
- War, terrorism, civil unrest, government actions
- Internet, telecommunications, or power outages
- Third-party service provider failures (APIs, cloud hosting)
- Cyberattacks, hacking, or security breaches
- Labor disputes, strikes, or supply chain disruptions

### 8.5 Jurisdictional Limitations

**UK Law Compliance:** The limitations in this Section 8 comply with UK law, including the Unfair Contract Terms Act 1977 and Consumer Rights Act 2015. For users in other jurisdictions, if local law does not allow certain limitations, our liability is limited to the maximum extent permitted by that jurisdiction's law.

## 9. INDEMNIFICATION

You agree to **indemnify, defend, and hold harmless** Avion, its officers, directors, employees, contractors, and licensors from and against any and all:

- Claims, lawsuits, disputes, or legal proceedings
- Liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees)
- Arising from or related to:
  - Your use or misuse of the Service
  - Your violation of these Terms or applicable laws
  - Your violation of third-party rights (intellectual property, privacy, etc.)
  - Aircraft accidents, incidents, or regulatory violations involving your use of Avion
  - AI-generated content you relied upon in operational decisions
  - Weather data inaccuracies that contributed to safety events
  - Crew duty violations resulting from calculator miscalculations

**This indemnification survives termination of your account and these Terms.**

## 10. GOVERNING LAW AND DISPUTE RESOLUTION (UK)

### 10.1 UK Company Registration

Avion Flight Management is registered in the **United Kingdom**.

**Contact Address:** hewittjswill@gmail.com  
**Registration:** [Companies House Registration Number to be added]

### 10.2 Governing Law

These Terms are governed by and construed in accordance with the **laws of England and Wales**, without regard to conflict of law principles.

### 10.3 Jurisdiction

The courts of **England and Wales** have **exclusive jurisdiction** to settle any dispute or claim arising out of or in connection with these Terms or their subject matter or formation (including non-contractual disputes or claims).

### 10.4 UK Consumer Rights Protection

**If you are a consumer in the United Kingdom**, nothing in these Terms affects your statutory rights under the **Consumer Rights Act 2015**, including but not limited to:

- Your right to reject faulty digital content within **30 days**
- Your right to a repair or replacement if digital content is faulty
- Your right to a price reduction or refund after one failed repair or replacement
- Protection against unfair contract terms

**Digital Content Standards:** Under UK law, digital content must be:
- Of **satisfactory quality**
- **Fit for a particular purpose** if you have made this purpose known to us
- **As described** in our service descriptions

### 10.5 Alternative Dispute Resolution

For consumer disputes, you may also use the UK Civil Aviation Authority's Alternative Dispute Resolution (ADR) scheme or the European Online Dispute Resolution (ODR) platform at https://ec.europa.eu/consumers/odr

### 10.6 Business User Disputes

For disputes between Avion and business users (non-consumers):

**Preferred Method:** Negotiation and mediation through the **Centre for Effective Dispute Resolution (CEDR)** or similar UK-based mediation service.

**Court Proceedings:** If mediation fails, disputes shall be resolved in the courts of England and Wales.

**Small Claims:** Claims under **£10,000** may be brought in the UK Small Claims Court (Money Claim Online).

## 11. MODIFICATIONS TO TERMS

### 11.1 Right to Modify

We reserve the right to modify these Terms at any time. Changes will be effective upon posting the updated Terms to the Service with a new "Last Updated" date.

### 11.2 Notice of Material Changes

For material changes that affect your rights or obligations, we will provide at least **30 days' advance notice** via:

- Email to your registered address
- In-app notification upon login
- Prominent notice on the Avion website

### 11.3 Continued Use Constitutes Acceptance

Your continued use of the Service after the effective date of modified Terms constitutes your acceptance of the changes. If you do not agree, you must discontinue use of the Service.

## 12. TERMINATION

### 12.1 Termination by You

You may terminate your account at any time by:

- Using the account deletion feature in Settings
- Emailing us at [hewittjswill@gmail.com] with your termination request

### 12.2 Termination by Us

We may suspend or terminate your account immediately, without notice, if:

- You violate these Terms or applicable laws
- You engage in fraudulent, abusive, or harmful conduct
- Required by law or regulatory authority
- Necessary to protect the Service or other users

### 12.3 Effect of Termination

Upon termination:

- Your license to use the Service immediately ceases
- We may delete your account data after a reasonable retention period
- Sections 6 (IP), 7 (Disclaimers), 8 (Liability), 9 (Indemnification), and 10 (Disputes) survive termination

## 13. PRIVACY AND DATA PROTECTION

Your use of the Service is also governed by our **Privacy Policy**, which explains how we collect, use, and protect your personal data. By using the Service, you consent to our data practices as described in the Privacy Policy.

Key points:

- We collect flight plans, weather queries, chat messages, and user profile data
- We share data with third-party service providers (Supabase, Google Gemini, weather APIs)
- We comply with GDPR (EU) and CCPA (California) requirements
- You have rights to access, correct, and delete your data

See our full **Privacy Policy** for details.

## 14. MISCELLANEOUS PROVISIONS

### 14.1 Entire Agreement

These Terms, together with the Privacy Policy and any supplemental agreements, constitute the entire agreement between you and Avion and supersede all prior agreements or understandings.

### 14.2 Severability

If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

### 14.3 Waiver

Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.

### 14.4 Assignment

You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms to any affiliate or successor entity.

### 14.5 No Third-Party Beneficiaries

These Terms are solely for the benefit of you and Avion and do not create any third-party beneficiary rights.

### 14.6 Headings

Section headings are for convenience only and do not affect interpretation of these Terms.

### 14.7 Contact Information

For questions about these Terms, please contact:

**Avion Legal Department**  
Email: hewittjswill@gmail.com  
Address: [Insert Company Address]

---

## ACKNOWLEDGMENT AND ACCEPTANCE

By clicking "I Agree," creating an account, or using the Service, you acknowledge that:

✅ You have read and understood these Terms of Service  
✅ You agree to be bound by these Terms  
✅ You understand the aviation safety disclaimers and limitations of liability  
✅ You accept sole responsibility for flight operations and regulatory compliance  
✅ You will verify all information with authoritative sources before flight operations  

**IF YOU DO NOT AGREE, DO NOT USE THIS SERVICE.**

---

**END OF TERMS OF SERVICE**

*Last Updated: November 17, 2025*  
*Version 1.0*
