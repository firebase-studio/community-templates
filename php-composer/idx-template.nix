{ pkgs, ... }: {
  bootstrap = ''
    cp -rf ${./app} "$WS_NAME"
    chmod -R +w "$WS_NAME"
    mv "$WS_NAME" "$out"
  '';
}