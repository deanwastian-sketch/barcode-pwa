function showProductInfo(barcode){
    const product = products[barcode];
    if(!product){ 
        alert("Artikel ni najden."); 
        return; 
    }

    // Ustavi Quagga in počakaj, da se video popolnoma ustavi
    Quagga.stop();
    scanning = false;

    setTimeout(() => {
        // Odstrani vse video elemente iz DOM, da input postane interaktiven
        const videos = document.querySelectorAll("#scanner video");
        videos.forEach(v => v.remove());

        document.getElementById("productName").innerText = product.name;
        document.getElementById("productDesc").innerText = product.desc;
        document.getElementById("productInfo").style.display = "block";
        document.getElementById("answerSection").style.display = "block";

        scannedArticles.push(barcode);
        updateProgress();
    }, 150); // 150ms timeout
}
