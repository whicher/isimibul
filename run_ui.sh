run_test_server() {
  jekyll serve
}

deploy_gh_pages() {
  echo "Deploying UI to github pages..."
  cp * ../../_DEPLOY_AREA/isimibul_gh_pages/.
}

help() {
  echo "Help commands: "
}

main () {
  if [ "$1" = "run_test_server" ]; then
    echo "Running test server..."
    run_test_server
  elif [ "$1" = "deploy_gh_pages" ]; then
    echo "Deploying web ui to github pages"
  else
    help
  fi
}
main $1