import flet as ft
import os
from flet_webview import WebView

# Function to read assets - for Android local asset loading
# Flet WebView on Android works best with http/https, but can load local HTML string
# or via a local server. For simplicity with flet build apk, we'll try loading
# content directly or via simple file reading if purely local.

# Optimized approach for Flet Mobile: 
# We will use a local variable to store the state file mapping and load html content.
# Since WebView content_html expects a string, avoiding local file:// permission issues.

def main(page: ft.Page):
    page.title = "District Story"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 0
    
    # State Management
    current_state = ft.Ref[str]()
    
    # WebView Control
    webview = WebView(
        expand=True,
        on_page_started=lambda _: print("Page started"),
        on_page_ended=lambda _: print("Page ended"),
    )

    def load_state_html(state_filename):
        # In a real packaged app, we might need a better way to access assets
        # For now, assuming assets are bundled and accessible relative to main.py
        # or we read them and inject as HTML string.
        
        # When packaged with 'flet build apk --include-assets assets', 
        # using the internal server URL is safest.
        # Flet provides page.get_asset_url()
        
        # Note: on Android, asset urls depend on how flet mounts them.
        # usually /assets mapping exists.
        
        asset_url = f"/assets/{state_filename}"
        webview.url = asset_url
        page.update()

    def change_theme(e):
        page.theme_mode = (
            ft.ThemeMode.LIGHT if page.theme_mode == ft.ThemeMode.DARK else ft.ThemeMode.DARK
        )
        page.update()

    def on_nav_change(e):
        selected_index = e.control.selected_index
        # Get state name from destination
        state_name = list(state_files.keys())[selected_index]
        filename = state_files[state_name]
        
        # Update Webview
        load_state_html(filename)
        
        # Close Drawer
        page.close_drawer()
        page.update()

    # Get List of States (HTML files)
    # Use absolute path relative to this script to ensure we find assets
    # regardless of where we run the command from.
    script_dir = os.path.dirname(os.path.abspath(__file__))
    asset_dir = os.path.join(script_dir, "assets")
    
    try:
        files = sorted([f for f in os.listdir(asset_dir) if f.endswith('.html')])
    except FileNotFoundError:
        print(f"Error: Assets directory not found at {asset_dir}")
        files = []
        
    state_files = {f.replace('_', ' ').replace('.html', ''): f for f in files}

    # Navigation Drawer
    drawer = ft.NavigationDrawer(
        on_change=on_nav_change,
        controls=[
            ft.Container(height=12),
            ft.NavigationDrawerDestination(
                label="Home",
                icon="home",
                selected_icon="home",
            ),
            ft.Divider(thickness=2),
        ] + [
            ft.NavigationDrawerDestination(
                icon="map", 
                label=state_name
            ) for state_name in state_files.keys()
        ],
    )

    # AppBar
    page.appbar = ft.AppBar(
        leading=ft.IconButton("menu", on_click=lambda e: page.open_drawer(drawer)),
        leading_width=40,
        title=ft.Text("District Story"),
        center_title=False,
        bgcolor="surfaceVariant",
        actions=[
            ft.IconButton("brightness_6", on_click=change_theme)
        ],
    )

    page.drawer = drawer
    
    # Body
    page.add(webview)
    
    # Initial Load
    if files:
        load_state_html(files[0]) # Load first state by default
    else:
        page.add(ft.Text("No data found. Please check assets."))

# ensure assets_dir is pointing to the right place for Flet internal server
script_dir = os.path.dirname(os.path.abspath(__file__))
ft.app(target=main, assets_dir=os.path.join(script_dir, "assets"))
