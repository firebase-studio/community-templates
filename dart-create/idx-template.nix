{pkgs, template ? "web", ...}: {
    channel = "stable-25.05";
    packages = [
        pkgs.curl
        pkgs.gnutar
        pkgs.xz
        pkgs.git
        pkgs.busybox
        pkgs.dart
    ];
    bootstrap = ''
        dart create --template="${template}" --no-pub "$out"
        mkdir "$out"/.idx
        cp ${./dev.nix} "$out"/.idx/dev.nix
        install --mode u+rw ${./dev.nix} "$out"/.idx/dev.nix
        chmod -R u+w "$out"
    '';
}