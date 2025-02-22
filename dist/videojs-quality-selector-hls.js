/*! @name videojs-quality-selector-hls @version 1.1.1 @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsQualitySelectorHls = factory(global.videojs));
}(this, (function (videojs) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

  var version = "1.1.1";

  const VideoJsButtonClass = videojs__default['default'].getComponent('MenuButton');
  const VideoJsMenuClass = videojs__default['default'].getComponent('Menu');
  const VideoJsComponent = videojs__default['default'].getComponent('Component');
  const Dom = videojs__default['default'].dom;
  /**
   * Convert string to title case.
   *
   * @param {string} string - the string to convert
   * @return {string} the returned titlecase string
   */

  function toTitleCase(string) {
    if (typeof string !== 'string') {
      return string;
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  /**
   * Convert string to title case.
   *
   * @param {Player} player - the string to convert
   * @return {MenuButton} the returned titlecase string
   */


  function ConcreteButton(player) {
    const ConcreteButtonInit = new VideoJsButtonClass(player, {
      title: player.localize('Quality'),
      name: 'QualityButton',
      createItems: () => {
        return [];
      },
      createMenu: () => {
        const menu = new VideoJsMenuClass(this.player_, {
          menuButton: this
        });
        this.hideThreshold_ = 0; // Add a title list item to the top

        if (this.options_.title) {
          const titleEl = Dom.createEl('li', {
            className: 'vjs-menu-title',
            innerHTML: toTitleCase(this.options_.title),
            tabIndex: -1
          });
          const titleComponent = new VideoJsComponent(this.player_, {
            el: titleEl
          });
          this.hideThreshold_ += 1;
          menu.addItem(titleComponent);
        }

        this.items = this.createItems();

        if (this.items) {
          // Add menu items to the menu
          for (let i = 0; i < this.items.length; i++) {
            menu.addItem(this.items[i]);
          }
        }

        return menu;
      }
    });
    return ConcreteButtonInit;
  }

  const VideoJsMenuItemClass = videojs__default['default'].getComponent('MenuItem');
  /**
   * Create a QualitySelectorHls plugin instance.
   *
   * @param  {player} player
   *         A Video.js Player instance.
   *
   * @param  {item} [item]
   *         The Item Quality Item
   *
   * @param  {qualityButton} [qualityButton]
   *         ConcreteButton
   *
   * @param  {plugin} plugin
   *         Plugin
   *
   * @return {MenuItem} MenuItem
   *         VideoJS Menu Item Class
   */

  function ConcreteMenuItem(player, item, qualityButton, plugin) {
    const ConcreteMenuItemInit = new VideoJsMenuItemClass(player, {
      label: item.label,
      selectable: true,
      selected: item.selected || false
    });
    ConcreteMenuItemInit.item = item;
    ConcreteMenuItemInit.qualityButton = qualityButton;
    ConcreteMenuItemInit.plugin = plugin;

    ConcreteMenuItemInit.handleClick = function () {
      // Reset other menu items selected status.
      for (let i = 0; i < this.qualityButton.items.length; ++i) {
        this.qualityButton.items[i].selected(false);
      } // Set this menu item to selected, and set quality.


      this.plugin.setQuality(this.item.value);
      this.selected(true);
    };

    return ConcreteMenuItemInit;
  }

  const defaults = {
    vjsIconClass: "vjs-icon-hd",
    displayCurrentQuality: false,
    placementIndex: 0
  };
  /**
   * An advanced Video.js plugin for HLS quality selection.
   */

  class QualitySelectorHlsClass {
    /**
     * Create a QualitySelectorHls plugin instance.
     *
     * @param  {Player} player
     *         A Video.js Player instance.
     *
     * @param  {Object} [options]
     *         Optional options object.
     */
    constructor(player, options) {
      this.player = player; // Merge options with defaults (use config throughout)

      this.config = videojs__default['default'].obj.merge(defaults, options);
      player.ready(() => {
        this.player.addClass("vjs-quality-selector-hls");

        if (this.player.qualityLevels) {
          // Create the quality button.
          this.createQualityButton();
          this.bindPlayerEvents();
        }
      });
    }
    /**
     * Returns HLS Plugin instance.
     *
     * @return {*} - The hls plugin instance.
     */


    getHls() {
      return this.player.tech({
        IWillNotUseThisInPlugins: true
      }).hls;
    }
    /**
     * Binds listener for quality level changes.
     */


    bindPlayerEvents() {
      this.player.qualityLevels().on("addqualitylevel", this.onAddQualityLevel.bind(this));
    }
    /**
     * Adds the quality menu button to the player control bar.
     */


    createQualityButton() {
      const player = this.player;
      this._qualityButton = new ConcreteButton(player);
      const placementIndex = player.controlBar.children().length - 2;
      const concreteButtonInstance = player.controlBar.addChild(this._qualityButton, {
        componentClass: "qualitySelector"
      }, this.config.placementIndex || placementIndex);
      concreteButtonInstance.addClass("vjs-quality-selector");

      if (!this.config.displayCurrentQuality) {
        const icon = ` ${this.config.vjsIconClass || "vjs-icon-hd"}`;
        concreteButtonInstance.menuButton_.$(".vjs-icon-placeholder").className += icon;
      } else {
        this.setButtonInnerText("auto");
      }

      concreteButtonInstance.removeClass("vjs-hidden");
    }
    /**
     * Sets the inner button text.
     *
     * @param {string} text - The text to display in the button.
     */


    setButtonInnerText(text) {
      this._qualityButton.menuButton_.$(".vjs-icon-placeholder").innerHTML = text;
    }
    /**
     * Builds an individual quality menu item.
     *
     * @param {Object} item - Individual quality menu item.
     * @return {ConcreteMenuItem} - Menu item instance.
     */


    getQualityMenuItem(item) {
      const player = this.player;
      return ConcreteMenuItem(player, item, this._qualityButton, this);
    }
    /**
     * Executed when a quality level is added from the HLS playlist.
     * Builds the quality menu such that the "Auto" option is always on top,
     * and the available quality levels are sorted in descending order.
     */


    onAddQualityLevel() {
      const player = this.player;
      const qualityList = player.qualityLevels();
      const levels = qualityList.levels_ || [];
      const levelItems = []; // Build a unique list of quality levels based on the shorter dimension.

      for (let i = 0; i < levels.length; ++i) {
        const {
          width,
          height
        } = levels[i];
        const pixels = Math.min(width, height);

        if (!pixels) {
          continue;
        }

        if (!levelItems.filter(existing => existing.item && existing.item.value === pixels).length) {
          const levelItem = this.getQualityMenuItem({
            label: pixels + "p",
            value: pixels
          });
          levelItems.push(levelItem);
        }
      } // Sort quality items in descending order (highest quality first).


      levelItems.sort((a, b) => {
        return b.item.value - a.item.value;
      }); // Create the Auto option and insert it at the top.

      const autoItem = this.getQualityMenuItem({
        label: player.localize("Auto"),
        value: "auto",
        selected: true
      });
      levelItems.unshift(autoItem);

      if (this._qualityButton) {
        this._qualityButton.createItems = function () {
          return levelItems;
        };

        this._qualityButton.update();
      }
    }
    /**
     * Sets quality (based on the shorter side of the video dimensions).
     * This method also flushes the current playback buffer to enforce an immediate switch.
     *
     * @param {number|string} quality - Either a number (e.g. 720) or 'auto'.
     */


    setQuality(quality) {
      const qualityLevels = this.player.qualityLevels();
      const levels = qualityLevels.levels_ || [];
      this._currentQuality = quality; // Update the quality button display

      if (this.config.displayCurrentQuality) {
        this.setButtonInnerText(quality === "auto" ? this.player.localize("Auto") : `${quality}p`);
      }

      let qualitySet = false; // Enable only the level that matches the chosen quality (or all if set to auto)

      levels.forEach(level => {
        const levelPixels = Math.min(level.width, level.height);

        if (quality === "auto" || levelPixels === quality) {
          level.enabled = true;
          qualitySet = true;
        } else {
          level.enabled = false;
        }
      });

      this._qualityButton.unpressButton(); // If a valid quality level was set, flush the current buffer to enforce the change.


      if (qualitySet) {
        const currentTime = this.player.currentTime();
        const volume = this.player.volume();
        const wasPlaying = !this.player.paused(); // Pause playback before flushing the buffer.

        this.player.pause(); // Use the tech's clearBuffer method if available; otherwise, seek slightly backward.

        const tech = this.player.tech();

        if (tech && typeof tech.clearBuffer === "function") {
          tech.clearBuffer();
        } else {
          const flushTime = currentTime > 0.1 ? currentTime - 0.1 : 0;
          this.player.currentTime(flushTime);
        } // Delay restoring playback to allow the quality change to take effect.


        setTimeout(() => {
          this.player.currentTime(currentTime);
          this.player.volume(volume);

          if (wasPlaying) {
            this.player.play();
          }
        }, 50); // Adjust delay if necessary.
      }
    }
    /**
     * Returns the current set quality or 'auto' if none has been set.
     *
     * @return {string|number} The currently set quality.
     */


    getCurrentQuality() {
      return this._currentQuality || "auto";
    }

  }

  const initPlugin = function (player, options) {
    const QualitySelectorHls = new QualitySelectorHlsClass(player, options);
    player.QualitySelectorHlsVjs = true;
    QualitySelectorHls.defaultState = {};
    QualitySelectorHls.VERSION = version;
    return QualitySelectorHls;
  };

  const QualitySelectorHls = function (options) {
    return initPlugin(this, videojs__default['default'].obj.merge({}, options));
  }; // Register the plugin with Video.js.


  videojs__default['default'].registerPlugin("qualitySelectorHls", QualitySelectorHls);

  return QualitySelectorHls;

})));
