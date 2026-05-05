(function() {
  window.TT = window.TT || {};

  /** FileList から .s1p〜.s9p のみ抽出して配列で返す */
  window.TT.filterSnp = function(fileList) {
    return Array.from(fileList).filter(f => /\.s\d+p$/i.test(f.name));
  };

  /**
   * ドロップゾーンに dragover / dragleave / drop イベントを設定する。
   * onFiles は生の FileList を受け取るコールバック。
   */
  window.TT.setupDropZone = function(dropZone, onFiles) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      onFiles(e.dataTransfer.files);
    });
  };

  /**
   * Blob を生成してファイルとしてダウンロードさせる。
   * @param {string|ArrayBuffer|Uint8Array} data
   * @param {string} filename
   * @param {string} [mimeType]
   */
  window.TT.downloadBlob = function(data, filename, mimeType = 'text/plain') {
    const blob = new Blob([data], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: filename }).click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
})();
