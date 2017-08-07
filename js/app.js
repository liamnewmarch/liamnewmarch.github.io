(function() {
  'use strict';

  /**
   * GitHub API class.
   *
   * @constructor
   * @param {string} username GitHub username.
   */
  var GitHubAPI = function(username) {
    this.username = username;
  };

  /**
   * GitHub API base URL.
   * @type {string}
   * @static
   */
  GitHubAPI.baseUrl = 'https://api.github.com';

  /**
   * Repos to exclude.
   * @type {string[]}
   * @static
   */
  GitHubAPI.exclude = [
    'liamnewmarch.github.io',
    'janineandliam.co.uk'
  ];

  /**
   * Get repos for the provided username. Tries local cache and defers to
   * API fetch if unsuccessful.
   *
   * @param {function} successCallback Called if the fetch was successful.
   * @param {function} errorCallback Called if the fetch was not succesful.
   */
  GitHubAPI.prototype.getRepos = function(successCallback, errorCallback) {
    try {
      var json = sessionStorage[this.username];
      var repos = JSON.parse(json);
      successCallback(repos);
    } catch (error) {
      this.fetchUserRepos(successCallback, errorCallback);
    }
  }

  /**
   * Fetch repos for the provided username from the GitHub API. Filters
   * the response and adds to the cache if successful.
   *
   * @param {function} successCallback Called if the fetch was successful.
   * @param {function} errorCallback Called if the fetch was not succesful.
   */
  GitHubAPI.prototype.fetchUserRepos = function(successCallback, errorCallback) {
    var path = GitHubAPI.baseUrl + '/users/' + this.username + '/repos';
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.addEventListener('load', function(event) {
      if (request.status === 200) {
        try {
          var data = JSON.parse(request.response);
          var filtered = this.filterWithPages(data);
          successCallback(filtered);
          sessionStorage[this.username] = JSON.stringify(filtered);
        } catch (error) {
          errorCallback(error);
        }
      }
    }.bind(this));
    request.addEventListener('error', errorCallback);
    request.send();
  }

  /**
   * Filter repos based on if the has_pages flag is set, then sorts by
   * updated_at.
   *
   * @param {Object[]} repos Array of repo objects.
   * @returns {Object[]} Filtered and sorted array of repo objects.
   */
  GitHubAPI.prototype.filterWithPages = function(repos) {
    return repos.filter(function(repo) {
      return repo.has_pages && !GitHubAPI.exclude.includes(repo.name);
    }).sort(function(a, b) {
      return new Date(a.updated_at) > new Date(b.updated_at) ? -1 : 1;
    });
  }

  /**
   * GitHub repo component.
   *
   * @constructor
   * @param {HTMLElement} element The HTML element which should be extended.
   */
  var GitHubReposComponent = function(element) {
    this.element = element;
    this.template = this._getTemplate();
    var username = this.element.getAttribute('github-username');
    var api = new GitHubAPI(username);
    api.getRepos(function(repos) {
      repos.forEach(this._render.bind(this));
    }.bind(this), function(error) {
      throw new Error(error);
    });
  };

  /**
   * Selector string of the elements which should be extended.
   * @type {string}
   * @static
   */
  GitHubReposComponent.selector = '[github-repos]';

  /**
   * Selector string of the element from which the template should be taken.
   * @type {string}
   * @static
   */
  GitHubReposComponent.templateSelector = '[github-repos-template]';

  /**
   * Regular expression to match template variables.
   * @type {RegExp}
   * @static
   */
  GitHubReposComponent.templateRegExp = /\{\{\s*(\w+)\s*\}\}/g;

  /**
   * Static method to find and extend matching elements.
   *
   * @static
   */
  GitHubReposComponent.register = function() {
    var elements = document.querySelectorAll(GitHubReposComponent.selector);
    [].forEach.call(elements, function(element) {
      new GitHubReposComponent(element);
    });
  };

  /**
   * Find the template and return it’s string value.
   *
   * @private
   * @returns {string} Template string.
   */
  GitHubReposComponent.prototype._getTemplate = function() {
    var selector = GitHubReposComponent.templateSelector;
    return document.querySelector(selector).innerHTML;
  };

  /**
   * Given a GitHub repo object, render the template and append to the element.
   *
   * @private
   * @param {object} repo A GitHub API repo object.
   */
  GitHubReposComponent.prototype._render = function(repo) {
    var re = GitHubReposComponent.templateRegExp;
    var a = document.createElement('a');
    a.className = 'repo-list-item';
    a.href = 'https://liamnewmarch.github.io/' + repo.name + '/'
    a.innerHTML = this.template.replace(re, function(_, key) {
      return repo[key] || '';
    });
    this.element.appendChild(a);
  };

  // Beep boop.
  GitHubReposComponent.register();
})();
