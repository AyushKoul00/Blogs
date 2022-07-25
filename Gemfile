source "https://rubygems.org"

gem "jekyll", "~> 4.2.2"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  # My extra stuff
  gem 'jekyll-seo-tag'
  gem 'jekyll-toc'
  gem "jekyll-remote-theme"
  gem "jekyll-redirect-from"
  gem "jekyll-paginate"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

gem "webrick", "~> 1.7"