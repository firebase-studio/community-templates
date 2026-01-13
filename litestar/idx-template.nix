{ pkgs, ... }: {
  packages = [
    pkgs.python3
    pkgs.python312Packages.pip
    pkgs.python312Packages.litestar
    pkgs.python312Packages.uvicorn
  ];
  bootstrap = ''    
    mkdir "$out"
    mkdir -p "$out/.idx/"
    cp -rf ${./dev.nix} "$out/.idx/dev.nix"
    shopt -s dotglob; cp -r ${./dev}/* "$out"
    chmod -R +w "$out"
    chmod +rwx "$out/devserver.sh"
  '';
}