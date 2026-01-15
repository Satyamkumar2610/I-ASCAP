import os
import glob
from bs4 import BeautifulSoup

def merge_html_files(output_dir="output/interactive"):
    """
    Merges [State]_Timeline.html and [State]_interactive.html into [State]_Merged.html
    """
    
    # Find all Timeline files
    timeline_files = glob.glob(os.path.join(output_dir, "*_Timeline.html"))
    
    for timeline_file in timeline_files:
        state_name = os.path.basename(timeline_file).replace("_Timeline.html", "")
        interactive_file = os.path.join(output_dir, f"{state_name}_interactive.html")
        output_file = os.path.join(output_dir, f"{state_name}_Merged.html")
        
        if not os.path.exists(interactive_file):
            print(f"Skipping {state_name}: Interactive file not found.")
            continue
            
        print(f"Merging files for {state_name}...")
        
        try:
            # Read Timeline Content
            with open(timeline_file, "r", encoding="utf-8") as f:
                timeline_soup = BeautifulSoup(f, "html.parser")
                
            # Read Interactive Content
            with open(interactive_file, "r", encoding="utf-8") as f:
                interactive_soup = BeautifulSoup(f, "html.parser")

            # Extract components from Timeline
            # Timeline usually has a div with a plot and some scripts
            timeline_div = timeline_soup.find("div") # The main plot container
            timeline_scripts = timeline_soup.find_all("script")

            # Extract components from Interactive
            # Interactive has style, network div, and scripts
            interactive_style = interactive_soup.find("style")
            network_div = interactive_soup.find("div", {"id": "mynetwork"})
            # We might need the container div if it has specific styles or classes
            # In the sample viewed, there's a card wrapper
            interactive_card = interactive_soup.find("div", class_="card")
            
            interactive_scripts = interactive_soup.find_all("script")
            interactive_links = interactive_soup.find_all("link")

            # Create New HTML Structure
            new_html = BeautifulSoup("<!DOCTYPE html><html><head></head><body></body></html>", "html.parser")
            
            # --- HEAD ---
            new_html.head.append(new_html.new_tag("meta", charset="utf-8"))
            new_html.head.append(new_html.new_tag("title"))
            new_html.head.title.string = f"{state_name} - District Evolution"
            
            # Add Bootstrap/Vis.js links from Interactive
            for link in interactive_links:
                new_html.head.append(link)

            # Add Styles
            # Add custom styles for layout if needed, plus the interactive style
            layout_style = new_html.new_tag("style")
            layout_style.string = """
                body { font-family: sans-serif; margin: 20px; background-color: #f8f9fa; }
                h1 { text-align: center; margin-bottom: 30px; color: #333; }
                .section-container { background: white; padding: 20px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .section-title { margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            """
            new_html.head.append(layout_style)
            if interactive_style:
                new_html.head.append(interactive_style)

            # --- BODY ---
            container = new_html.new_tag("div", class_="container-fluid")
            new_html.body.append(container)
            
            # Title
            title = new_html.new_tag("h1")
            title.string = f"{state_name} District Evolution"
            container.append(title)
            
            # Section 1: Timeline
            section1 = new_html.new_tag("div", class_="section-container")
            h2_1 = new_html.new_tag("h2", class_="section-title")
            h2_1.string = "Timeline Visualization"
            section1.append(h2_1)
            # Append Timeline DIV
            if timeline_div:
                section1.append(timeline_div)
            else:
                section1.append(new_html.new_tag("p").string("Error: Timeline content not found."))
            container.append(section1)

            # Section 2: Network Graph
            section2 = new_html.new_tag("div", class_="section-container")
            h2_2 = new_html.new_tag("h2", class_="section-title")
            h2_2.string = "Interactive Network Graph"
            section2.append(h2_2)
            # Append Interactive Card/Div
            if interactive_card:
                section2.append(interactive_card)
            elif network_div:
                section2.append(network_div)
            else:
                 section2.append(new_html.new_tag("p").string("Error: Network graph content not found."))
            container.append(section2)

            # --- SCRIPTS ---
            # Add Plotly scripts (from Timeline)
            for script in timeline_scripts:
                new_html.body.append(script)
            
            # Add Vis.js/Bootstrap scripts (from Interactive)
            for script in interactive_scripts:
                 # Check if it's already added (basic check by src)
                 if script.has_attr("src"):
                     is_duplicate = False
                     for existing_script in new_html.body.find_all("script"):
                         if existing_script.has_attr("src") and existing_script["src"] == script["src"]:
                             is_duplicate = True
                             break
                     if not is_duplicate:
                         new_html.body.append(script)
                 else:
                     # Inline scripts - append them
                     new_html.body.append(script)

            # Save Merged File
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(str(new_html))
            
            print(f"Successfully created: {output_file}")
            
        except Exception as e:
            print(f"Error merging {state_name}: {e}")

if __name__ == "__main__":
    merge_html_files()
