from fastapi import FastAPI,Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai import GenerativeModel, configure
import os
import re
import json
import google.generativeai as genai
import logging
from typing import Dict,Optional, Any
from pydantic import BaseModel
import requests 
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_courses: Dict[str, Any] = {}
# Configure Gemini
GEMINI_API_KEY = "AIzaSyBsVjwUGb8XP2plCzQaKuRDV9yexoV4dPI"
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set")

try:
    configure(api_key=GEMINI_API_KEY)
    model = GenerativeModel("gemini-1.5-flash")
except Exception as e:
    raise ValueError(f"Failed to configure Gemini API: {str(e)}")


logger = logging.getLogger("main")

def cleanup_gemini_responsee(response_text: str):
    try:
        # Step 1: Remove Markdown code block formatting (```json ... ```)
        clean_text = re.sub(r"^```json\s*|\s*```$", "", response_text.strip(), flags=re.IGNORECASE)

        # Step 2: Strip any remaining artifacts
        clean_text = clean_text.strip("` \n")

        # Step 3: Find the first valid JSON array block (in case of extra surrounding text)
        json_match = re.search(r"\[\s*{.*}\s*\]", clean_text, flags=re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            # If no match, try using the cleaned text directly
            json_text = clean_text

        # Step 4: Parse the JSON
        return json.loads(json_text)

    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {e}")
        return {"error": "Gemini response could not be parsed as JSON", "raw_output": response_text}

# Utility: Cleanup raw Gemini response into valid JSON
def cleanup_gemini_response(raw_text: str):
    logger.info(f"Raw Gemini Output: {raw_text[:500]}")  # Log first 500 chars

    if not raw_text or not raw_text.strip():
        logger.warning("Empty response from Gemini")
        return {"error": "Empty response from Gemini"}

    try:
        json_start = raw_text.find('{')
        json_end = raw_text.rfind('}') + 1
        
        if json_start == -1 or json_end == 0:
            logger.error("No valid JSON structure found")
            return {
                "error": "No valid JSON structure found in Gemini response",
                "raw_output": raw_text
            }

        json_str = raw_text[json_start:json_end]
        parsed = json.loads(json_str)
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {str(e)}")
        try:
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                parsed = json.loads(json_str)
                return parsed
            else:
                logger.error("Regex fallback failed: No JSON found")
                return {
                    "error": "Gemini response could not be parsed as JSON",
                    "raw_output": raw_text
                }
        except Exception as e2:
            logger.error(f"Fallback parsing failed: {str(e2)}")
            return {
                "error": "Gemini response could not be parsed as JSON",
                "raw_output": raw_text
            }
    except Exception as e:
        logger.error(f"Unexpected error in parsing: {str(e)}")
        return {
            "error": "Unexpected error during response parsing",
            "raw_output": raw_text
        }

class ModuleMetadataResponse(BaseModel):
    course_name: str
    levels: list

@app.get("/agent/module-metadata",response_model=ModuleMetadataResponse)
async def generate_module_metadata(course_name: str = Query(..., min_length=1)):
    logger.info(f"Processing module metadata request for course: {course_name}")
    try:
        domain_function = '''Determine the domain name according to the "{course_name}" and then the use the below fields based onthe domain.
        ### 🧭 DOMAIN-SPECIFIC DECOMPOSITION STRATEGIES:

#### 🔬 PHYSICS:
- Focus on conceptual frameworks + mathematical formulation.
- Emphasize problem-solving techniques, units, and interrelated phenomena.
- Include real-world phenomena and diagrams (textual).

#### 🧪 CHEMISTRY:
- Prioritize atomic/molecular-level understanding + reactions.
- Include visual analogies (e.g., orbital diagrams), reaction mechanisms, and lab methods.
- Use periodic trends, valency, and structures as organizing principles.

#### 🌱 BIOLOGY:
- Emphasize layered systems (cell → organ → organism → ecosystem).
- Use diagrams, processes (like transcription), and definitions.
- Prioritize classifications, functions, and feedback systems.

#### 🧠 COMPUTER SCIENCE:
- Emphasize abstractions, system architecture, and algorithms.
- Show stepwise logic, pseudocode, and complexity reasoning.
- Use examples with code and visual flow of logic.

#### 🧮 MATHEMATICS:
- Focus on definitions, theorem-proof-application sequences.
- Use symbolic manipulation, problem variations, and logic chains.
- Encourage derivation steps and alternate solution methods.

#### 📚 HISTORY:
- Focus on timelines, causality, evidence interpretation.
- Structure content chronologically and thematically.
- Include primary/secondary source analysis, map context, and critical perspectives.

#### 🏛 CIVICS:
- Emphasize institutional structures, rights, policies.
- Use real-world laws and case studies.
- Foster critical analysis and participatory thinking.

#### 🎨 ARTS:
- Emphasize historical context, aesthetic styles, and expressive techniques.
- Use visual examples and critique frameworks.
- Encourage creative exercises and reflective interpretations.

#### 🌍 GEOGRAPHY:
- Emphasize spatial thinking, map analysis, environment-human interaction.
- Integrate physical and human geography.
- Use case studies and geospatial tools.'''


        prompt =  f"""
You are an elite AI curriculum architect, trained in instructional design, AI-powered education, and semantic scaffolding of complex knowledge systems.

Your job is to design a **highly structured, adaptive, and pedagogically optimized curriculum** for the course: "{course_name}" using your knowledge of "{domain_function}".

The curriculum must simulate a top-tier AI educator — capable of dynamically adjusting instructional flow, cognitive scaffolding, and content block sequencing to maximize learning depth and retention.

---

### STEP 1: Deep Semantic Analysis of the Course

Before generation, perform a deep breakdown of:
- The course "{course_name}" within the context of "{domain_function}"
- Identify core knowledge domains, skills, cognitive models, and conceptual hierarchies.
- Classify the subject as:
  - Theory-heavy, Practice-heavy, or Hybrid
- Determine real-world applications, expected learning outcomes, and progression logic from zero knowledge to mastery.

---

### STEP 2: Generate Modular Structure by Levels

Design a learning path divided into **Beginner, Intermediate, and Advanced** levels.
- Each level contains a number of logically sequenced modules.
For each level, define a set of **Modules** with:
- `module_title`: A descriptive title
- `module_summary`: What the module teaches and why it's essential
- `prerequisites`: Required knowledge or skills
- `outcomes`: What the learner will be able to do (based on Bloom’s Taxonomy)
"hotline": For every module, generate a deeply reflective and strategic `hotline` — a personalized teaching blueprint written from the perspective of an expert educator.
it should be deeply define as you are teaching this module and how would you teach this module it would be easy to lsearn wand give pratical application too.
Imagine you are the **lead instructor** for this module. Reflect on the following as part of your hotline:

1. 🧭 **Teaching Strategy**:
   - If you're teaching this module, **what key concepts** will you emphasize and **why**?
   - Which parts would need **more time, focus, or creative explanation**?
   - Would you use diagrams, analogies, real-world problems, storytelling, simulations?

2. 🧠 **Cognitive Load Plan**:
   - Is the module **theory-heavy**, **application-heavy**, or **hybrid**?
   - How would you **balance theory and practice**?
   - Which parts require **deep conceptual clarity** vs. **hands-on application**?

3. 🔍 **Prerequisite Awareness**:
   - What **prior knowledge** or modules are **critical to understand this one well**?
   - If learners skipped those, what quick refreshers or scaffolds should be inserted?

4. 🛠️ **Practical Relevance**:
   - What are the **real-world use cases** of this module?
   - Are there any **projects, labs, or hands-on activities** to make learning tangible?
   - How will learners apply this knowledge in careers, research, or innovation?

5. 🧱 **Content Block Construction Blueprint**:
   - Based on the module metadata (summary, outcomes, skills, prerequisites, linked modules), how easy or challenging will it be to:
     - Generate **meaningful chapters**
     - Design diverse `learning_flow` blocks like `["theory", "quiz", "assignment", "flashcards", "workbook"]`
   - Are any parts too vague or too complex for structured flow?

6. 🧩 **Interconnectedness**:
   - How does this module **connect back to other modules** via `linked_modules`?
   - Should certain chapters reference older modules for reinforcement?
   - Does this module prepare learners **forward** for harder modules?

7. 🎯 **Learning Outcome Impact**:
   - Will the learner be **job-ready**, **conceptually clear**, or **creatively confident** after this?
   - Does this module produce thinkers, doers, or both?

> 💡 End your hotline with a quick **recommendation** to curriculum builders: _Should this module be a standalone track, a bridge, or a foundational prerequisite to others?_

The tone should be reflective, strategic, and deeply educational — like an elite AI teacher reviewing the module before creating its content blocks.


- `linked_modules`: Mention if this module **depends on** or **extends** ideas from previous modules. 
  > Write clearly, e.g., “Builds upon concepts introduced in ‘Module X’.”
  > Do not list all modules — only those it *logically connects* to in terms of prior learning or conceptual flow.

> ⚠️ Rules for Modules:
- Follow logical learning progression (Beginner → Intermediate → Advanced)
- Do not balance levels evenly — only include necessary modules
- Sequence based on teaching logic, not number
- Ensure each module can be broken down into multiple Chapters
- No chapters or chapter-level content
- Modules must flow logically from beginner to advanced
- Metadata must be accurate, deep, and domain-aligned
---


Respond ONLY in clean JSON:
```json
{{
  "course_title": "{course_name}",
  "levels": [
    {{
      "level": "Beginner",
      "modules": [
        {{
          "module_title": "",
          "module_summary": "",
          "prerequisites": [],
          "outcomes": [],
          "hotline": "",
          
          "linked_modules": [],
         
        }}
      ]
    }}
  ]
}}
```"""

        logger.info("Sending module-only prompt to Gemini API")
        response = model.generate_content(prompt)

        if not hasattr(response, 'text') or not response.text:
            logger.error(f"Empty or invalid response from Gemini: {response}")
            return JSONResponse(content={"error": "Empty response from Gemini API"}, status_code=500)

        module_data = cleanup_gemini_response(response.text)

        if "error" in module_data:
          logger.error(f"Parsing error: {module_data}")
          return JSONResponse(content=module_data, status_code=500)

# ✅ Save the parsed course data
        key = course_name.lower().strip()
        stored_courses[key] = module_data

        logger.info("Module metadata generation successful")
        return JSONResponse(content={"course": module_data})

        

        logger.info("Module metadata generation successful")
        return JSONResponse(content={"course": module_data})

    except Exception as e:
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)
class CourseResponse(BaseModel):
    course_name: str
    module_name:str
    chapter_name:str
    block_title:str
@app.get("/agent/generate-chapter-content",response_model=CourseResponse)
async def generate_chapter_content(course_name: str= Query(..., min_length=1), module_name: str= Query(..., min_length=1), chapter_name: str= Query(..., min_length=1), block_title: str= Query(..., min_length=1)):

    """
    API Endpoint to generate content for a specific chapter based on course name and module name and block title.
    """
    try:
        # Retrieve stored course data for the given course name
        course_key = course_name.lower().strip()
        if course_key not in stored_courses:
            return JSONResponse(content={"error": "Course not found. Please generate module metadata first."}, status_code=404)
        
        course_data = stored_courses[course_key]

        # Find the specific module and chapter
        selected_module = None
        selected_chapter = None
        for level in course_data.get("levels", []):
            for module in level.get("modules", []):
                if module.get("module_title").lower() == module_name.lower():
                    selected_module = module
                    for chapter in module.get("chapters", []):
                        if chapter.get("chapter_title").lower() == chapter_name.lower():
                            selected_chapter = chapter
                            break
                if selected_chapter:
                    break
            if selected_chapter:
                break

        # If no module or chapter is found, return an error
        if not selected_module:
            return JSONResponse(content={"error": f"Module '{module_name}' not found in course '{course_name}'."}, status_code=404)
        
        if not selected_chapter:
        
            return JSONResponse(content={"error": f"Chapter '{chapter_name}' not found in module '{module_name}'."}, status_code=404)
       # Get the linked modules for the current module
        linked_modules = selected_module.get("linked_modules", [])
        learning_blocks = selected_chapter.get("learning_flow", [])
        generated_blocks = []

        for block in learning_blocks:
            block_type = block.get("type")
            # Look for the specific theory block by block_title from the query parameter
            requested_block = next((block for block in learning_blocks if block.get("type") == "theory" and block.get("title").lower().strip() == block_title.lower().strip()),None)

# If not found, return error
            if not requested_block:
               return JSONResponse(content={"error": f"Theory block '{block_title}' not found in chapter '{chapter_name}'."}, status_code=404)

# Now use only this requested block
            block_type = requested_block.get("type")


            
               
        # Build the prompt for chapter content generation
            prompt = f"""
You are an elite AI educational agent. Given the following module metadata,chapter title and block title , generate detailed content for the chapter:

🎯 Generate content for:

- Block Title: {block_title}
- Section/Subtopic: {block_title}

Focus strictly on the *block_title* and ensure that all content is directly related to and aligned with this subtopic. The content should not go into broader chapter concepts unless necessary to provide context or references.
The content must strictly align with this {block_title} and represent it clearly.
### Module Metadata:
- Title: {selected_module.get("module_title")}
- Summary: {selected_module.get("module_summary")}
- Outcomes: {selected_module.get("outcomes")}
- Prerequisites: {selected_module.get("prerequisites")}
- Hotline (Teacher Strategy): {selected_module.get("hotline")}
- Linked Modules: {", ".join(linked_modules)}

### Chapter Metadata:
- Chapter Title: {selected_chapter.get("chapter_title")}
- Chapter Summary: {selected_chapter.get("chapter_summary")}
- Block Title: {block_title}


📌 **Important**:
The content should focus entirely on the subtopic **"{block_title}"**. While the chapter context is important, do not divert into unrelated aspects. Stick to the **block title** as the core focus.

⚠️ **Objective**:
Generate high-quality, deep theory content for the **"{block_title}"** using chapter with the metadata and context. The content should simulate an expert professor explaining the subject in a university-level setting. Make the content structured, pedagogical, and insightful, ensuring that the learner is guided through the concept from basics to deeper understanding.

🧠 Content Guidelines:
Only include the following content types if they are relevant to the chapter’s subject matter. You should intelligently decide what to include and in what order, based on the chapter topic and learning flow.Do not include quiz assignment etc if not mentioned
Only generate the mentioned content not the quiz,assignment,workbook for any **type** =="theory"
1. **`paragraph`**  
   - Provide rich, multi-paragraph conceptual explanations  
   - Break down ideas clearly with real-life analogies  
   - Build depth layer-by-layer like a great professor’s lecture  

2. **`overview`**  
   - Introduce the chapter’s topic  
   - Provide historical context, purpose, and where this fits in the bigger picture  
   - Set the stage for deeper sections to follow  

3. **`algorithm`**  
   - Title of algorithm  
   - Brief intro and purpose  
   - Step-by-step logic (pseudo-code or simple numbered format)  
   - Explanation of each step  
   - Time/space complexity  
   - Edge cases or tips  

4. **`table`**  
   - Use for comparison, classifications, summaries  
   - Include proper headings and row labels  
   - Precede and follow with a brief explanation  

5. **`formulas`**  
   - Include key formulas  
   - Explain each variable  
   - Provide derivation if applicable  
   - Add 1–2 use cases or sample applications  

6. **`glossary`**  
   - List important terms introduced in the chapter  
   - Each term must have a definition and a usage/example  

7. **`key_points`**  
   - List 6–10 bullet points that capture the essence of the chapter  
   - No vague statements — make them powerful and unique  

8. **`types`**  
   - If the concept has types/classifications  
   - List each with explanation, example, and key use  

9. **`real_world_example`**  
   - Provide real-life scenarios or industry applications  
   - Explain how the concept works in that situation  

10. **`use_cases`**  
   - List multiple ways this chapter’s concept is used in the real world  
   - For each: title, context, how the concept applies, benefit  

11. **`case_study`**  
   - Write a full case study: background, problem, application, results, and reflections  
   - Can be real or hypothetical but must feel grounded  

12. **`bullet_points`**  
   - Use for lists of features, characteristics, or essential facts  
   - Write sharp, concise, and high-value bullets  

13. **`flowchart`**  
   - Describe a process using step-by-step textual flow  
   - Use arrows or numbers  
   - Introduce what the process is and why it matters  

14. **`tips_and_tricks`**  
   - Include mnemonics, analogies
   - Help students retain complex ideas or avoid mistakes  

15. **`common_mistakes`**
   -Mistakes that can be made while learning
   -
---
🧭 Inter-Chapter Linking Guidelines:Follow it strictly
If any concept being explained would benefit from deeper explanation which exists in another chapter of this course, please insert a conversational line like:

> "To explore this topic in more detail, refer to **'{linked_modules}'" and mention the chapter name also as you know all the metadata of the chapters and module

Make sure:
- These references are based on the actual stored course metadata (modules and chapters).
- Don’t insert links unless the chapter actually exists and relates to the current topic.
- Maintain a natural tone as if guiding a student during a lecture.

### 🧠 Output Expectation:

- Each block should be **educator-grade quality**
- Ensure **zero repetition** and **no generic content**
- All blocks should be **connected to the metadata context** (like outcomes, hotline, or prerequisites)
- Be logically structured and **ideal for self-learners, teachers, and textbooks**
- Content should be in conversational tone and with linked module logic written above
- Content should be according to title block no repeatition of content should be there
- Output only **structured JSON** as described
 Ensure that **block_title** is consistently referenced throughout the content.
- Only include content types that are relevant to the **block_title**.
- Avoid content overlap across different blocks (e.g., do not mix content about other chapters or modules unless specifically linked).
- The structure of the response must be logical, cohesive, and aligned with the learning flow
---
📘 Possible Content Blocks to Include (if contextually appropriate):

🧱 Output Format (Strict JSON)
Return the content in a structured JSON array. Each content block should follow this format:

{{
  "chapter_title": "Your Chapter Title",
  "content": [
    {{
      "type": "content_type_here",
      "data": "structured data as per type"
    }},
    ...
  ]
}}

Each type should have specified fields in data :-
##paragraph-only normal paragraph in data.
##overview-only normal paragraph in data.
##algorithm-title,purpose,comments,,key terms,steps,explanation,,code,time and space complexity,tips
##table-title,header,rows,explanation
##formulas-title,latex,description,formula,variables,derivaton,usecases
##glossary:-term,defination,usecase
##keypoints:-data in points
##types:-name,description,example,key uses
##real-world examples:-scenario,description
##use-cases:title,context,appllication,benefit
##case study:title,background,problem,application,results,reflections
##bulletpoints:-data to be kept in bullet
##flowcharts:-title,introduction,steps 
##tips and tricks:-tip analogy or mnemonic
##common mistakes:-in data it should be mentioned

📌 Ensure that:
-Content shoud align strictly with block title name if the content in one block should come in second block too then it should not get explained twice it should be in its particular module
-Content should be according to block_title no broader scope content shoud be there
-Content is original, deep, and highly explanatory.
-No block is included unless contextually relevant.
-Every explanation connects to the chapter’s goals, learning outcomes, and module theme.
-Avoid repeating the same ideas across multiple blocks.
-Sequence of the block should not be maintained if any block is needed any item we can rearrange it in json but the coontent should come in flow.

🔁 Use the module_metadata and chapter_metadata and block_title deeply to guide tone, depth, and focus.
"""

        # Generate the content from Gemini API
            logger.info(f"Generating chapter content for {chapter_name} in module {module_name} of course {course_name}")
            response = model.generate_content(prompt)
            print(response)
            if not hasattr(response, 'text') or not response.text:
                logger.error(f"Empty or invalid response from Gemini for chapter content generation.")
                generated_blocks.append({
                        "block_title": block_title,
                        "error": "Empty response from Gemini"
                    })
                return JSONResponse(content={"error": "Empty response from Gemini API"}, status_code=500)

        # Clean and parse the response
            chapter_content = cleanup_gemini_responsee(response.text)
            if "error" in chapter_content:
                    generated_blocks.append({
                        "block_title": block_title,
                        "error": chapter_content["error"]
                    })
        # Store the generated theory inside the selected chapter
            if "theory" not in selected_chapter:
                selected_chapter["theory"] = {}
            selected_chapter["theory"][block_title] = chapter_content
                
            generated_blocks.append({"block_title": block_title, "status": "Generated successfully"})
    
# Update the course in global storage
            stored_courses[course_key] = course_data


            if "error" in chapter_content:
                logger.error(f"Parsing error for chapter content: {chapter_content}")
                return JSONResponse(content=chapter_content, status_code=500)

        # Return the generated chapter content
            return JSONResponse(content={"chapter_content": chapter_content})

    except Exception as e:
        logger.error(f"Internal error during chapter content generation: {str(e)}", exc_info=True)
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)


class ChapterGeneration(BaseModel):
    course_name: str
    module_title:str
      
@app.get("/agent/generate-chapters",response_model=ChapterGeneration)
async def generate_chapters(course_name: str = Query(...), module_title: str = Query(...)):
    try:
        key = course_name.lower().strip()
        if key not in stored_courses:
            return JSONResponse(
                content={"error": "Course not found. Please generate module metadata first."},
                status_code=404
            )

        course_data = stored_courses[key]

        # Locate the selected module
        selected_module = None
        for level in course_data.get("levels", []):
            for module in level.get("modules", []):
                if module.get("module_title") == module_title:
                    selected_module = module
                    break
            if selected_module:
                break

        if not selected_module:
            return JSONResponse(
                content={"error": f"Module '{module_title}' not found."},
                status_code=404
            )

        # Gather all existing chapter titles to avoid duplication
        all_existing_chapters = set()
        for level in course_data.get("levels", []):
            for module in level.get("modules", []):
                for ch in module.get("chapters", []):
                    all_existing_chapters.add(ch.get("chapter_title"))

        # Collect all module metadata (for Gemini prompt context)
        all_module_metadata = []
        for level in course_data.get("levels", []):
            for module in level.get("modules", []):
                all_module_metadata.append({
                    "module_title": module.get("module_title"),
                    "module_summary": module.get("module_summary"),
                    "outcomes": module.get("outcomes"),
                    "prerequisites": module.get("prerequisites"),
                    "hotline": module.get("hotline"),
                    "linked_modules": module.get("linked_modules"),
                })

        # Metadata for the selected module
        current_module = {
            "module_title": selected_module.get("module_title"),
            "module_summary": selected_module.get("module_summary"),
            "outcomes": selected_module.get("outcomes"),
            "prerequisites": selected_module.get("prerequisites"),
            "hotline": selected_module.get("hotline"),
            "linked_modules": selected_module.get("linked_modules"),
        }
                # Prompt for Gemini
        prompt = f"""
You're an elite AI educational agent. You must generate chapter-level content for a module **without repeating content from other modules**.

### Full Course Context:
Here are all module metadata (for awareness, DO NOT generate for them):

{all_module_metadata}

### Current Module for Chapter Generation:
{current_module}

### Existing Chapters Across Modules (Avoid Title Overlap):
{list(all_existing_chapters)}

### Instructions:
- Ensure chapter titles are unique and avoid repeating ideas from existing chapters.
- Maintain conceptual clarity — link chapters to other modules only when necessary.
- Follow the exact format below. Do not use Markdown or code blocks.
- Each Block can appear with multiple time so that theory is useful and in deep depth and occurence will be decided by gemini as what it is needed in that particular theory
[
  {{
    "chapter_title": "",
    "chapter_summary": "",
    "linked_chapters": [],
    "learning_flow": [
      {{
        "type": "theory" | "quiz" | "assignment" | "workbook" | "flashcards",
        "title": "Title of this learning block (based on topic or subtopic)",
        "why": "Explain the purpose of this block in the learning flow",
        "subtopics": ["subtopic1", "subtopic2"]
      }}
    ]
  }}
]
📘 Learning Flow Block Title Rules:
- Each learning flow block (theory, quiz, etc.) MUST include a `"title"` describing the purpose or scope.
- Use chapter metadata or subtopics to craft the title.
- Examples:
  - `"title": "Introduction to Activation Functions"`
  - `"title": "Quiz on Supervised Learning Models"`
  - `"title": "Flashcards for Optimization Techniques"`
  - `"title": "Assignment: Implement Gradient Descent"`

📌 Tips:
- Title should help learners immediately understand what the block covers.
- Tailor quiz/assignment titles to match the skills being tested or practiced.

"""

                # Call Gemini model
        response = model.generate_content(prompt)

        if not hasattr(response, 'text') or not response.text:
            logger.error(f"Empty or invalid response from Gemini for module: {module_title}")
                    
        parsed_chapters = cleanup_gemini_responsee(response.text)

        if "error" in parsed_chapters:
            logger.warning(f"Parsing failed for module: {module_title}")
               

                # Save chapters to memory and response data
        selected_module["chapters"] = parsed_chapters
        for ch in parsed_chapters:
            all_existing_chapters.add(ch.get("chapter_title"))

        return JSONResponse(
            content={
                "message": f"Chapters successfully generated for module: {module_title}",
                "chapters": parsed_chapters
            }
        )

    except Exception as e:
        logger.error(f"Internal error during chapter generation: {str(e)}", exc_info=True)
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)

class WorkbookResponse(BaseModel):
    course_name: str
    module_name:str
    chapter_name:str
    block_title:str
@app.get("/agent/generate-workbook",response_model=WorkbookResponse)
async def generate_workbook(course_name: str=Query(..., min_length=1), module_name: str=Query(..., min_length=1), chapter_name: str =Query(..., min_length=1),block_title:str=Query(..., min_length=1)):
    try:
        course_key = course_name.lower().strip()
        if course_key not in stored_courses:
            return JSONResponse(
                content={"error": "Course not found. Please generate module metadata first."},
                status_code=404
            )

        course_data = stored_courses[course_key]
        workbook_data = {
            "course_title": course_name,
            "modules": []
        }

        target_modules = []
        if module_name:
            found = False
            for level in course_data.get("levels", []):
                for module in level.get("modules", []):
                    if module.get("module_title").lower() == module_name.lower():
                        target_modules.append((level, module))
                        found = True
                        break
                if found:
                    break
            if not found:
                return JSONResponse(
                    content={"error": f"Module '{module_name}' not found in course '{course_name}'."},
                    status_code=404
                )
        else:
            for level in course_data.get("levels", []):
                for module in level.get("modules", []):
                    target_modules.append((level, module))

        for level, module in target_modules:
            module_title = module.get("module_title")
            logger.info(f"Generating workbook for module: {module_title}")
            module_workbook = {
                "module_title": module_title,
                "level": level.get("level"),
                "chapters": []
            }

            for chapter in module.get("chapters", []):
                chapter_title = chapter.get("chapter_title")
                if chapter_name and chapter_title.lower() != chapter_name.lower():
                    continue

                chapter_theory = chapter.get("theory")
                if not chapter_theory:
                    logger.warning(f"No theory content for chapter: {chapter_title}")
                    continue

                prompt = f"""
You are an elite AI educational agent tasked with generating a workbook section for a specific chapter.
The workbook must be based strictly on the taught theory content and metadata provided, with no external concepts introduced.

### Course Metadata:
- Course Title: {course_name}
- Module Title: {module_title}
- Module Summary: {module.get("module_summary")}
- Module Outcomes: {module.get("outcomes")}
- Module Prerequisites: {module.get("prerequisites")}
- Module Hotline: {module.get("hotline")}
- Linked Modules: {module.get("linked_modules")}

### Chapter Metadata:
- Chapter Title: {chapter_title}
- Chapter Summary: {chapter.get("chapter_summary")}
- Linked Chapters: {chapter.get("linked_chapters", [])}
- Learning Flow: {chapter.get("learning_flow", [])}

### Chapter Theory (Reference Content):
{json.dumps(chapter_theory, indent=2)}

### Instructions:
Generate a workbook section for this chapter with the following question types:
1. Short Answer:-Generate question answer with hints if answer is wrong then give guiding question if not then proceed
2. Fill-in-the-Blanks:-give fill in the blank question and no option for it
3. Scenario-Based:-Depict some scenarios in deep according to theory generateed and then give qustion answer with hints and if answer is not correct then give guiding question with it
4. Question-Answer:-Some questions with hints
5. Case Study:-case study should be given deep then questions with hints and guiding question if answered wrong
6. Flowchart:-give sequenced flowchart and then rearrange it and after that give number and ask them to arrange it if sequnece is correct then proceed if not then give guiding
question suffled option should be more
4.Each Block can appear with multiple time so that workbook is useful and in deep depth and occurence will be decided by gemini as what it is needed in that particular workbook
{{
  "type": "question_type",
  "data": {{
    "question": "...",
    "answer": "...",
    "hint": "...",
    "guiding_questions": [...]
  }}
}}

Ensure JSON formatting and field accuracy.
Output format:
{{
  "chapter_title": "...",
  "chapter_summary": "...",
  "questions": [
    {{ "type": "Short Answer", "data": {{ ... }} }},
    {{ "type": "Case Study", "data": {{ ... }} }},
    ...
  ]
}}
"""

                response = model.generate_content(prompt)

                if not hasattr(response, 'text') or not response.text:
                    logger.warning(f"No response from Gemini for chapter '{chapter_title}'")
                    continue

                parsed = cleanup_gemini_response(response.text)
                if "error" in parsed:
                    logger.warning(f"Parsing error: {parsed['error']}")
                    continue

                module_workbook["chapters"].append(parsed)

            if module_workbook["chapters"]:
                workbook_data["modules"].append(module_workbook)

        return JSONResponse(content=workbook_data)

    except Exception as e:
        logger.error(f"Workbook generation failed: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": "Failed to generate workbook", "details": str(e)},
            status_code=500
        )
    

@app.get("/agent/generate-quiz")
async def generate_quiz(course_name: str, module_name: str, chapter_name: str):
    try:
        course_key = course_name.lower().strip()
        if course_key not in stored_courses:
            return JSONResponse(
                content={"error": "Course not found. Please generate module metadata first."},
                status_code=404
            )

        course_data = stored_courses[course_key]

        # Find module and chapter
        module_data = None
        for level in course_data.get("levels", []):
            for module in level.get("modules", []):
                if module.get("module_title", "").lower() == module_name.lower():
                    module_data = module
                    break
            if module_data:
                break

        if not module_data:
            return JSONResponse(
                content={"error": f"Module '{module_name}' not found in course '{course_name}'."},
                status_code=404
            )

        chapter_data = next(
            (c for c in module_data.get("chapters", []) if c.get("chapter_title", "").lower() == chapter_name.lower()),
            None
        )
        if not chapter_data:
            return JSONResponse(
                content={"error": f"Chapter '{chapter_name}' not found in module '{module_name}'."},
                status_code=404
            )

        theory = chapter_data.get("theory")
        if not theory:
            return JSONResponse(
                content={"error": f"Theory content missing in chapter '{chapter_name}'."},
                status_code=400
            )

        prompt = f"""
You are an expert quiz generator agent.

### Task:
Generate a quiz for a specific chapter using the module/chapter metadata and theory provided.

### Course: {course_name}
### Module Title: {module_data.get("module_title")}
- Summary: {module_data.get("module_summary")}
- Outcomes: {module_data.get("outcomes")}
- Prerequisites: {module_data.get("prerequisites")}
- Hotline: {module_data.get("hotline")}

### Chapter Title: {chapter_data.get("chapter_title")}
- Summary: {chapter_data.get("chapter_summary")}
- Linked Chapters: {chapter_data.get("linked_chapters", [])}
- Learning Flow: {chapter_data.get("learning_flow", [])}

### Theory Taught:
{json.dumps(theory, indent=2)}

### Instructions:
Generate a list of quiz questions that includes:
- Multiple Choice Questions (MCQs)
- True/False

Each question must include:
- "question": The question text
- "options": List of choices (for MCQ only)
- "answer": The correct answer
- "hints": Helpful hints (1-2 max)

### Output Format (JSON only, no explanation):
{{
  
  "chapter_title": "...",
  "chapter_summary": "...",
  "type": "quiz_questions",
  "data": [
    {{
      "question": "Which type of machine learning is best suited for clustering similar items without predefined labels?",
      "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Semi-supervised Learning"],
      "answer": "Unsupervised Learning",
      "hints": [
        "This method groups data based on patterns without knowing the output.",
        "Think of grouping users based on listening habits."
      ]
    }},
    {{
      "question": "Machine learning requires hardcoded rules to make decisions. (True/False)",
      "answer": "False",
      "hints": [
        "Think about how ML differs from traditional programming.",
        "ML learns patterns from data instead of using hardcoded instructions."
      ]
    }}
  ]
}}
Only output valid JSON in the above format.
"""

        response = model.generate_content(prompt)
        if not hasattr(response, 'text') or not response.text:
            return JSONResponse(
                content={"error": "No response from Gemini for quiz generation."},
                status_code=500
            )

        quiz_output = cleanup_gemini_response(response.text)

        # Ensure top-level output format
        if "type" not in quiz_output or quiz_output["type"] != "quiz_questions":
            return JSONResponse(
                content={"error": "Unexpected response format from Gemini."},
                status_code=500
            )

        return JSONResponse(content=quiz_output)

    except Exception as e:
        logger.error(f"Quiz generation failed: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": "Failed to generate quiz", "details": str(e)},
            status_code=500
        )

@app.get("/agent/generate-assignment")
async def generate_assignment(course_name: str, module_name: Optional[str] = None, chapter_name: Optional[str] = None):
    try:
        course_key = course_name.lower().strip()
        if course_key not in stored_courses:
            return JSONResponse(
                content={"error": "Course not found. Please generate module metadata first."},
                status_code=404
            )

        course_data = stored_courses[course_key]
        assignment_data = {
            "course_title": course_name,
            "modules": []
        }

        target_modules = []
        if module_name:
            found = False
            for level in course_data.get("levels", []):
                for module in level.get("modules", []):
                    if module.get("module_title").lower() == module_name.lower():
                        target_modules.append((level, module))
                        found = True
                        break
                if found:
                    break
            if not found:
                return JSONResponse(
                    content={"error": f"Module '{module_name}' not found in course '{course_name}'."},
                    status_code=404
                )
        else:
            for level in course_data.get("levels", []):
                for module in level.get("modules", []):
                    target_modules.append((level, module))

        for level, module in target_modules:
            module_title = module.get("module_title")
            logger.info(f"Generating assignment for module: {module_title}")
            module_assignment = {
                "module_title": module_title,
                "level": level.get("level"),
                "chapters": []
            }

            for chapter in module.get("chapters", []):
                chapter_title = chapter.get("chapter_title")
                if chapter_name and chapter_title.lower() != chapter_name.lower():
                    continue

                chapter_theory = chapter.get("theory")
                if not chapter_theory:
                    logger.warning(f"No theory content for chapter: {chapter_title}")
                    continue

                prompt = f"""
You are an AI educational agent tasked with generating **assignment** content for a chapter based strictly on taught theory and metadata. Do not introduce any concepts not covered in the theory.

### Course Metadata:
- Course Title: {course_name}
- Module Title: {module_title}
- Module Summary: {module.get("module_summary")}
- Module Outcomes: {module.get("outcomes")}
- Module Prerequisites: {module.get("prerequisites")}
- Module Hotline: {module.get("hotline")}
- Linked Modules: {module.get("linked_modules")}

### Chapter Metadata:
- Chapter Title: {chapter_title}
- Chapter Summary: {chapter.get("chapter_summary")}
- Linked Chapters: {chapter.get("linked_chapters", [])}
- Learning Flow: {chapter.get("learning_flow", [])}

### Chapter Theory (Reference):
{json.dumps(chapter_theory, indent=2)}

### Instructions:
Generate a structured assignment block with the following types:
1. Case Study-Based Questions (provide a detailed scenario, followed by questions, hints, and guiding questions)
2. Research-Based Tasks (require students to explore beyond the theory and apply concepts in real-world or comparative analysis)
3. Question-Answer Section (challenge students to apply chapter theory in practical ways, with hints and guiding questions)
4.Each Block can appear with multiple time so that assignment is useful and in deep depth and occurence will be decided by gemini as what it is needed in that particular assignment
Format each item like this:
{{
  "type": "question_type",
  "data": {{
    "question": "...",
    "answer": "...",
    "hint": "...",
    "guiding_questions": ["..."]
  }}
}}

Output JSON format:
{{
  "chapter_title": "...",
  "chapter_summary": "...",
  "assignments": [
    {{ "type": "Case Study", "data": {{ ... }} }},
    {{ "type": "Research Task", "data": {{ ... }} }},
    {{ "type": "Q&A", "data": {{ ... }} }}
  ]
}}
"""
                response = model.generate_content(prompt)

                if not hasattr(response, 'text') or not response.text:
                    logger.warning(f"No response from Gemini for chapter '{chapter_title}'")
                    continue

                parsed = cleanup_gemini_response(response.text)
                if "error" in parsed:
                    logger.warning(f"Parsing error: {parsed['error']}")
                    continue

                module_assignment["chapters"].append(parsed)

            if module_assignment["chapters"]:
                assignment_data["modules"].append(module_assignment)

        return JSONResponse(content=assignment_data)

    except Exception as e:
        logger.error(f"Assignment generation failed: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": "Failed to generate assignment", "details": str(e)},
            status_code=500
        )

if __name__ == "__main__":
    
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)