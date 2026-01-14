{ pkgs, ... }: {
  packages = [
    pkgs.elan
  ];
  bootstrap = ''
    mkdir "$out"
    mkdir "$out"/.idx
    cp ${./dev.nix} "$out"/.idx/dev.nix
    chmod -R +w "$out"
  '';
}