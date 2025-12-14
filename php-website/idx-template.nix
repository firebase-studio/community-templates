{ pkgs, ... }: {
  packages = [
    pkgs.php 
    pkgs.nodejs_20 
    pkgs.python3 
  ];
  bootstrap = ''
    # Kopiere den Inhalt des Template-Ordners in den Arbeitsbereich
    cp -rf ${./.} "$out"

    # Lösche die Templatedateien und die Git-Verbindung
    rm -rf "$out/.git" "$out/idx-template".{nix,json} 
  '';
}