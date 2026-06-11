#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir documentos Markdown a PDF con estilos profesionales
Proyecto: Restaurante Señor Hornado - Sistema POS
"""

import markdown
import os
from weasyprint import HTML, CSS
from datetime import datetime

def create_pdf_from_markdown(markdown_file, output_pdf):
    """
    Convierte un archivo Markdown a PDF con estilos profesionales.
    
    Args:
        markdown_file (str): Ruta del archivo markdown
        output_pdf (str): Ruta del archivo PDF de salida
    """
    
    # Leer archivo markdown
    print(f"📖 Leyendo archivo: {markdown_file}")
    with open(markdown_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convertir markdown a HTML
    print("🔄 Convirtiendo Markdown a HTML...")
    md = markdown.Markdown(
        extensions=['tables', 'fenced_code', 'codehilite', 'toc']
    )
    html_content = md.convert(md_content)
    
    # CSS para estilos profesionales
    css_content = """
    @page {
        size: A4;
        margin: 2cm;
        @top-center {
            content: "Evidencia GA2-220501093-AA3-EV01: Validación de Documentos";
            font-size: 10pt;
            color: #666;
        }
        @bottom-right {
            content: "Página " counter(page) " de " counter(pages);
            font-size: 10pt;
            color: #666;
        }
    }
    
    * {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
    }
    
    body {
        margin: 0;
        padding: 0;
        background: white;
        counter-reset: page;
    }
    
    h1 {
        color: #1a472a;
        border-bottom: 3px solid #4A90E2;
        padding-bottom: 10px;
        margin-top: 20px;
        margin-bottom: 15px;
        font-size: 24pt;
        break-after: avoid;
    }
    
    h2 {
        color: #2c5aa0;
        border-left: 4px solid #4A90E2;
        padding-left: 10px;
        margin-top: 15px;
        margin-bottom: 10px;
        font-size: 18pt;
        break-after: avoid;
    }
    
    h3 {
        color: #3d7bc4;
        margin-top: 12px;
        margin-bottom: 8px;
        font-size: 14pt;
        break-after: avoid;
    }
    
    h4, h5, h6 {
        color: #4A90E2;
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 12pt;
    }
    
    p {
        margin: 10px 0;
        text-align: justify;
    }
    
    a {
        color: #4A90E2;
        text-decoration: none;
        border-bottom: 1px dotted #4A90E2;
    }
    
    a:hover {
        color: #2c5aa0;
    }
    
    ul, ol {
        margin: 10px 0;
        padding-left: 30px;
    }
    
    li {
        margin: 5px 0;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        page-break-inside: avoid;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    thead {
        background: linear-gradient(135deg, #4A90E2, #357abd);
        color: white;
    }
    
    th {
        padding: 12px;
        text-align: left;
        font-weight: bold;
        border: 1px solid #357abd;
    }
    
    td {
        padding: 10px 12px;
        border: 1px solid #ddd;
    }
    
    tbody tr:nth-child(odd) {
        background: #f8f9fa;
    }
    
    tbody tr:hover {
        background: #e8f1f9;
    }
    
    pre {
        background: #f5f5f5;
        border-left: 4px solid #4A90E2;
        padding: 12px;
        overflow-x: auto;
        font-size: 10pt;
        line-height: 1.4;
        margin: 10px 0;
    }
    
    code {
        font-family: 'Courier New', monospace;
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11pt;
    }
    
    pre code {
        background: none;
        padding: 0;
        border-radius: 0;
    }
    
    blockquote {
        border-left: 4px solid #4A90E2;
        padding-left: 15px;
        margin-left: 0;
        color: #666;
        font-style: italic;
    }
    
    .highlight {
        background: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
    }
    
    hr {
        border: none;
        border-top: 2px solid #4A90E2;
        margin: 20px 0;
    }
    
    strong {
        color: #1a472a;
        font-weight: 600;
    }
    
    em {
        color: #555;
        font-style: italic;
    }
    
    .mermaid {
        text-align: center;
        margin: 20px 0;
        page-break-inside: avoid;
        border: 1px solid #ddd;
        padding: 10px;
        background: #f9f9f9;
    }
    
    footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 10pt;
        color: #999;
        text-align: center;
    }
    """
    
    # Crear HTML completo con estilos
    full_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Evidencia GA2-220501093-AA3-EV01</title>
        <style>
            {css_content}
        </style>
    </head>
    <body>
        <div class="content">
            {html_content}
        </div>
        <footer>
            <p>Documento generado automáticamente • {datetime.now().strftime('%d de %B de %Y')}</p>
            <p>Proyecto: Sistema POS y Facturación Electrónica - Restaurante Señor Hornado</p>
        </footer>
    </body>
    </html>
    """
    
    # Convertir HTML a PDF
    print(f"📄 Generando PDF: {output_pdf}")
    try:
        HTML(string=full_html).write_pdf(output_pdf)
        print(f"✅ PDF creado exitosamente: {output_pdf}")
        print(f"📊 Tamaño del archivo: {os.path.getsize(output_pdf) / 1024:.2f} KB")
        return True
    except Exception as e:
        print(f"❌ Error al generar PDF: {e}")
        return False

if __name__ == "__main__":
    # Rutas
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    markdown_file = os.path.join(
        base_dir, 
        "Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.md"
    )
    output_pdf = os.path.join(
        base_dir, 
        "Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.pdf"
    )
    
    # Validar que el archivo markdown existe
    if not os.path.exists(markdown_file):
        print(f"❌ Error: Archivo no encontrado: {markdown_file}")
        exit(1)
    
    # Convertir a PDF
    success = create_pdf_from_markdown(markdown_file, output_pdf)
    
    if success:
        print("\n" + "="*60)
        print("✨ Conversión completada exitosamente")
        print("="*60)
        print(f"📁 Ubicación: {output_pdf}")
    else:
        exit(1)
