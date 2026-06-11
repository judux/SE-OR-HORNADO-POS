$htmlPath = "c:\Users\johan\Desktop\señor hornado\Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.html"
$pdfPath = "c:\Users\johan\Desktop\señor hornado\Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.pdf"

Write-Host "[*] Convertiendo HTML a PDF..."
Write-Host "[*] Archivo HTML: $htmlPath"
Write-Host "[*] Archivo PDF de salida: $pdfPath"

try {
    # Crear objeto COM de Word
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    
    # Abrir archivo HTML
    $doc = $wordApp.Documents.Open($htmlPath)
    
    # Guardar como PDF
    $doc.SaveAs([ref] $pdfPath, [ref] 17)
    
    Write-Host "[+] PDF creado exitosamente"
    Write-Host "[*] Ubicación: $pdfPath"
    
    # Verificar tamaño
    if (Test-Path $pdfPath) {
        $fileSize = (Get-Item $pdfPath).Length / 1KB
        Write-Host "[*] Tamaño: $($fileSize.ToString('F2')) KB"
    }
    
    # Cerrar documento y Word
    $doc.Close()
    $wordApp.Quit()
}
catch {
    Write-Host "[!] Error: $_"
}
