goog.provide('ol.source.TileImage');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ol.ImageTile');
goog.require('ol.TileCoord');
goog.require('ol.TileLoadFunctionType');
goog.require('ol.TileState');
goog.require('ol.TileUrlFunction');
goog.require('ol.TileUrlFunctionType');
goog.require('ol.source.Tile');
goog.require('ol.source.TileEvent');



/**
 * @classdesc
 * Base class for sources providing images divided into a tile grid.
 *
 * @constructor
 * @fires ol.source.TileEvent
 * @extends {ol.source.Tile}
 * @param {olx.source.TileImageOptions} options Image tile options.
 * @api
 */
ol.source.TileImage = function(options) {

  goog.base(this, {
    attributions: options.attributions,
    extent: options.extent,
    logo: options.logo,
    opaque: options.opaque,
    projection: options.projection,
    state: options.state !== undefined ?
        /** @type {ol.source.State} */ (options.state) : undefined,
    tileGrid: options.tileGrid,
    tilePixelRatio: options.tilePixelRatio,
    wrapX: options.wrapX
  });

  /**
   * @protected
   * @type {ol.TileUrlFunctionType}
   */
  this.tileUrlFunction = options.tileUrlFunction !== undefined ?
      options.tileUrlFunction :
      ol.TileUrlFunction.nullTileUrlFunction;

  /**
   * @protected
   * @type {?string}
   */
  this.crossOrigin =
      options.crossOrigin !== undefined ? options.crossOrigin : null;

  /**
   * @protected
   * @type {ol.TileLoadFunctionType}
   */
  this.tileLoadFunction = options.tileLoadFunction !== undefined ?
      options.tileLoadFunction : ol.source.TileImage.defaultTileLoadFunction;

  /**
   * @protected
   * @type {function(new: ol.ImageTile, ol.TileCoord, ol.TileState, string,
   *        ?string, ol.TileLoadFunctionType)}
   */
  this.tileClass = options.tileClass !== undefined ?
      options.tileClass : ol.ImageTile;

};
goog.inherits(ol.source.TileImage, ol.source.Tile);


/**
 * @param {ol.ImageTile} imageTile Image tile.
 * @param {string} src Source.
 */
ol.source.TileImage.defaultTileLoadFunction = function(imageTile, src) {
  imageTile.getImage().src = src;
};


/**
 * @inheritDoc
 */
ol.source.TileImage.prototype.getTile =
    function(z, x, y, pixelRatio, projection) {
  var tileCoordKey = this.getKeyZXY(z, x, y);
  if (this.tileCache.containsKey(tileCoordKey)) {
    return /** @type {!ol.Tile} */ (this.tileCache.get(tileCoordKey));
  } else {
    goog.asserts.assert(projection, 'argument projection is truthy');
    var tileCoord = [z, x, y];
    var urlTileCoord = this.getTileCoordForTileUrlFunction(
        tileCoord, projection);
    var tileUrl = !urlTileCoord ? undefined :
        this.tileUrlFunction(urlTileCoord, pixelRatio, projection);
    var tile = new this.tileClass(
        tileCoord,
        tileUrl !== undefined ? ol.TileState.IDLE : ol.TileState.EMPTY,
        tileUrl !== undefined ? tileUrl : '',
        this.crossOrigin,
        this.tileLoadFunction);
    goog.events.listen(tile, goog.events.EventType.CHANGE,
        this.handleTileChange_, false, this);

    this.tileCache.set(tileCoordKey, tile);
    return tile;
  }
};


/**
 * Return the tile load function of the source.
 * @return {ol.TileLoadFunctionType} TileLoadFunction
 * @api
 */
ol.source.TileImage.prototype.getTileLoadFunction = function() {
  return this.tileLoadFunction;
};


/**
 * Return the tile URL function of the source.
 * @return {ol.TileUrlFunctionType} TileUrlFunction
 * @api
 */
ol.source.TileImage.prototype.getTileUrlFunction = function() {
  return this.tileUrlFunction;
};


/**
 * Handle tile change events.
 * @param {goog.events.Event} event Event.
 * @private
 */
ol.source.TileImage.prototype.handleTileChange_ = function(event) {
  var tile = /** @type {ol.Tile} */ (event.target);
  switch (tile.getState()) {
    case ol.TileState.LOADING:
      this.dispatchEvent(
          new ol.source.TileEvent(ol.source.TileEventType.TILELOADSTART, tile));
      break;
    case ol.TileState.LOADED:
      this.dispatchEvent(
          new ol.source.TileEvent(ol.source.TileEventType.TILELOADEND, tile));
      break;
    case ol.TileState.ERROR:
      this.dispatchEvent(
          new ol.source.TileEvent(ol.source.TileEventType.TILELOADERROR, tile));
      break;
  }
};


/**
 * Set the tile load function of the source.
 * @param {ol.TileLoadFunctionType} tileLoadFunction Tile load function.
 * @api
 */
ol.source.TileImage.prototype.setTileLoadFunction = function(tileLoadFunction) {
  this.tileCache.clear();
  this.tileLoadFunction = tileLoadFunction;
  this.changed();
};


/**
 * Set the tile URL function of the source.
 * @param {ol.TileUrlFunctionType} tileUrlFunction Tile URL function.
 * @api
 */
ol.source.TileImage.prototype.setTileUrlFunction = function(tileUrlFunction) {
  // FIXME It should be possible to be more intelligent and avoid clearing the
  // FIXME cache.  The tile URL function would need to be incorporated into the
  // FIXME cache key somehow.
  this.tileCache.clear();
  this.tileUrlFunction = tileUrlFunction;
  this.changed();
};


/**
 * @inheritDoc
 */
ol.source.TileImage.prototype.useTile = function(z, x, y) {
  var tileCoordKey = this.getKeyZXY(z, x, y);
  if (this.tileCache.containsKey(tileCoordKey)) {
    this.tileCache.get(tileCoordKey);
  }
};
