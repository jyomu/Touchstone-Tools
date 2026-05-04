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
})();
