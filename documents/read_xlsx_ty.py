import zipfile
import re
import xml.etree.ElementTree as ET
import sys
import os

def clean_tag(tag):
    return re.sub(r'\{.*\}', '', tag)

def read_xlsx_pure(file_path):
    try:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return

        with zipfile.ZipFile(file_path, 'r') as z:
            # 1. Read Shared Strings (lookup table)
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                with z.open('xl/sharedStrings.xml') as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    # namespace handling might be needed, but let's try simple iteration
                    for si in root:
                        # si is the string item
                        # t is the text tag
                        text = "" 
                        # Find all text nodes recursively
                        for t in si.iter():
                            if t.tag.endswith('t') and t.text:
                                text += t.text
                        shared_strings.append(text)
            
            # 2. Read Sheets
            # We'll just look for sheet1, sheet2, etc.
            sheet_files = [n for n in z.namelist() if n.startswith('xl/worksheets/sheet')]
            
            print(f"Found {len(sheet_files)} sheets.")
            
            for sheet_file in sorted(sheet_files):
                print(f"\n--- Content from {sheet_file} ---")
                with z.open(sheet_file) as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    # Iterate over rows and cells
                    # namespaces are annoying in simple scripts, let's just iter all elements
                    # and find 'c' (cell) tags
                    
                    rows_data = []
                    
                    # A robust way is to use the namespace map if possible, but let's simplify
                    # We look for 'row' elements
                    for elem in root.iter():
                        if elem.tag.endswith('row'):
                            row_cells = []
                            for cell in elem:
                                if cell.tag.endswith('c'):
                                    cell_val = ""
                                    t_attr = cell.get('t') # Type: s=shared string
                                    
                                    # Value is in 'v' tag
                                    v_tag = None
                                    for child in cell:
                                        if child.tag.endswith('v'):
                                            v_tag = child
                                            break
                                    
                                    if v_tag is not None and v_tag.text:
                                        val = v_tag.text
                                        if t_attr == 's':
                                            idx = int(val)
                                            if idx < len(shared_strings):
                                                cell_val = shared_strings[idx]
                                            else:
                                                cell_val = f"<String {idx} not found>"
                                        else:
                                            cell_val = val
                                    
                                    if cell_val:
                                        row_cells.append(cell_val)
                            
                            if row_cells:
                                print(" | ".join(row_cells))

    except Exception as e:
        print(f"Error reading xlsx: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_xlsx.py <file_path>")
    else:
        read_xlsx_pure(sys.argv[1])
