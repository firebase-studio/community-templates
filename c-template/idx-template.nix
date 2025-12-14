
{ pkgs, ... }: {
  packages=[];
  bootstrap = ''    
    mkdir "$out"
    mkdir -p "$out/.idx/"
    cp -rf ${./dev.nix} "$out/.idx/dev.nix"
    cp -r ${./src}/* "$out"
    chmod -R +w "$out"
    '';
}