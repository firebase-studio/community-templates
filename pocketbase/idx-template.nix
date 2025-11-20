
{ pkgs, ... }: {
  packages = [
    pkgs.go
  ];
  bootstrap = ''
    mkdir "$out"
    chmod +w "$out"

    cp -r ${./dev}/. "$out"

    chmod -R +w "$out"

    cd "$out"

    go mod tidy
  '';
}
