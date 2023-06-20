import type {
  SigninPopupArgs,
  SignoutRedirectArgs,
  User,
  UserManager,
  UserManagerSettings,
  UserProfile,
} from 'oidc-client-ts';
import { Observable, fromEvent as rxjsFromEvent } from 'rxjs';

import type * as _ from 'underscore';

/// A basic JSON definition use when concrete types/interfaces don't (yet) exist
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * A Mapworks map consists of a heirarchy of layers, groups or references to other maps;
 * each of these is a node derived from this class.
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.entity.BaseTreeNodeEntity
 */
export declare class MapworksBaseTreeNodeEntity {

  /// Find the first node with the specified reference ID
  public findByReferenceId(refId: string): MapworksTreeEntity;

}

/**
 * A Mapworks map consists of a heirarchy of layers, groups or references to other maps;
 * each of these is a node derived from this class.
 *
 * @note Layers should be redrawn after making changes that alter how they are
 *       displayed on the map, e.g. changing visibility or styles.
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.entity.TreeEntity
 */
export declare class MapworksTreeEntity extends MapworksBaseTreeNodeEntity {

  /// This layer tree node's reference ID
  public getReferenceId(): string;

  /// This layer tree node's title
  public getTitle(): string;



  /**
   * Redraws this Layer Selector node and its children.
   *
   * Layers should be redrawn after making changes that alter how they are
   * displayed on the map, e.g. changing visibility or styles.
   */
  public redraw(): MapworksTreeEntity;

  /**
   * Determines if a Layer Selector node is visible.
   *
   * @param checkParent if true, the node's parents also have to be visible
   *                    for this node to be considered visible. Defaults to `true`.
   * @returns `true` if visible, `false` if not
   */
  public isVisible(checkParent?: boolean): boolean;

  /**
   * Sets the visibility of a Layer Selector node.
   *
   * For a layer to be visible on the map, all of its parent nodes must also be visible.
   * @param visible true to set the node to visible
   */
  public setVisible(visible: boolean): MapworksTreeEntity;

}

/**
 * Mapworks layer and context within the Studio Layer Selector.
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.entity.TreeEntity
 */
export declare class MapworksTreeLayerEntity extends MapworksTreeEntity {

  /// The feature set ID of the layer associated with this Layer Selector tree node
  public getFeatureSetId(): string;

  /// Triggers an identify event (typically triggering highlighting within the layer selector)
  public identify(): MapworksTreeLayerEntity;

}

/**
 * A TreeLayerEntity that contains vector features. Vector layers may be of type ADHOC, FILTERED or VECTOR.
 */
export declare class MapworksTreeVectorLayerEntity extends MapworksTreeLayerEntity {

  ///
  public constructor(options: any, mapOptions: { map: MapworksMap });

}


/**
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.entity.FeatureEntity
 */
export declare class MapworksFeatureEntity {

  public attributes: {
    /// Display layer name for the feature in the tooltip.
    displayLayerName: string;

    /// List of fields to be displayed in the tooltip (keys mapped to human readable display names).
    fields: {
      [humanReadableName: string]: string | number; // XXX TODO Check types
    }

    /// List of fields to be displayed in the tooltip.
    rawFields: {
      [fieldName: string]: string | number; // XXX TODO Check types
    }

    /// Feature ID
    id: string;

    /// Layer containing this feature
    layer: MapworksTreeLayerEntity;

    /// Feature type
    type: MapworksFeatureType;

    /// Flag denoting whether the feature is filled.
    filled: boolean;
  }

  ///
  public getDisplayName(): string;

}

///
export declare class MapworksVectorPointEntity extends MapworksFeatureEntity {

}

///
export declare class MapworksVectorPolygonEntity extends MapworksFeatureEntity {

}

/**
 * An event that is generated when a user performs interactively using the mouse on the the map or features on the map.
 */
export declare class MapworksFeatureEvent {
  /**
   * The vector feature being 'browsed'; may be null if no feature involved.
   */
  getFeature(): MapworksFeatureEntity | null;

  /// Check if there is any feature associated with this feature event.
  isAnyFeature(): boolean;

  /// The X Position of the mouse which caused this event.
  getX(): number;

  /// The Y Position of the mouse which caused this event.
  getY(): number;

  /// The event type
  getType(): MapworksMapEventType;
}

/**
 * Class provided to display template (mouseover, mouse click etc) functions.
 *
 * @see MapworksFeatureDisplayTemplates
 */
export declare class MapworksFeatureDisplayContext {

  // helpers
  // DOMPurify
  // _

  /// The CSS class name that should be used for the top-level encapsulating element (typically a `<div>`)
  className: string;

  /// Layer name, formatted for display, of the layer containing the feature in the tooltip.
  displayLayerName: string;

  // Feature name, formatted for display in the tooltip.
  displayName: string;

  ///
  model: MapworksFeatureEntity;

  /// List of fields to be displayed in the tooltip (keys mapped to human readable display names).
  fields: {
    [humanReadableName: string]: string | number; // XXX TODO Check types
  }

  // As per fields, but sorted (and with _primary key_ annotation)
  sortedFields: {
    title: string;
    value: string | number;
    isKey: boolean;
  }[];

  /// Feature ID
  id: string;

  /// Layer containing this feature
  layer: MapworksTreeLayerEntity;


  /// The x position for tooltip to show.
  x: number;

  /// The y position for tooltip to show.
  y: number;

  /// A reference to the map this feature belongs to.
  map: MapworksMap;

  /// The event type for this tooltip.
  type: MapworksFeatureEventType;

  /// Default template function under to render HTML for tis display event.
  template: (context: MapworksFeatureDisplayContext) => string;

  /**
   * Whether this display event should be rendered as a default or child view.
   */
  mode: MapworksTooltipViewMode;

  /**
   * The collapse status in child view mode.
   */
  collapse: boolean;
}

/**
 * Collection of feature display templates; those set depend on the
 * event type (mouseover, mouse click, or drill-down/ all visible features).
 */
export declare class MapworksFeatureDisplayTemplates {
  /**
   * The mouse over tooltip template
   * or undefined if this is not the mouseover event.
   */
  mouseoverTpl?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The highlighted click tooltip template
   * or undefined if this is not the highlighted click event.
   */
  clickTpl?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The custom tooltip template
   * or undefined if this is not the custom popover event.
   */
  customPopoverTpl?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The layout template for the all visible feature click event;
   * undefined if this is not the all visible feature click event.
   */
  layout?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The title template for the all visible feature click event;
   * undefined if this is not the all visible feature click event.
   */
  title?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The layer group template for the all visible feature click event;
   * undefined if this is not the all visible feature click event.
   */
  layerGroup?: (context: MapworksFeatureDisplayContext) => string;

  /**
   * The feature template for the all visible feature click event;
   * undefined if this is not the all visible feature click event.
   */
  feature?: (context: MapworksFeatureDisplayContext) => string;
}

///
export enum MapworksFeatureType {
  ///
	UNKNOWN = 0,

	/// Point
	POINT = 1,

	/// Polyline
	POLYLINE = 2,

	/// Text
	TEXT = 3,

	/// Circle
	CIRCLE = 4,

	/// Polygon
	POLYGON = 5,

	/// Rectangle
	RECTANGLE = 6,

	/// Multi geometry feature
	MULTI = 7,

	/// Image
	IMAGE = 8,

	/// Annotation
	ANNOTATION = 16
}

///
export enum MapworksFeatureEventType {
	/**
	 * An event triggered by mouse over a feature.
	 */
	MOUSEOVER = 0,
	/**
	 * A mouse click event on the map or feature.
	 */
	MOUSECLICK = 1,
	/**
	 * A right click event on the map or feature.
	 */
	MOUSECLICK_RIGHT = 2,
	/**
	 * A 'mouse press' or 'touch-start' event.
	 */
	MOUSEDOWN = 3,
	/**
	 * A tooltip event when the mouse position is at a position over period of
	 * time. This is used to display the tooltip for a feature.
	 */
	TOOLTIP = 4
};

/**
 * The TooltipView render mode.
 */
export enum MapworksTooltipViewMode {
	/** Render tooltip view as stand alone view */
	VIEW = 'view',
	/** Render tooltip view as part of composite view */
	CHILD_VIEW = 'childView'
};

///
export type MapworksMapFeatureEventType = 'feature:mouseover' | 'feature:mouseclick' | 'feature:tooltip' | 'feature:longpress'; // XXX TODO Better name
///
export type MapworksMapEventType = 'ready' | 'accessToken:change' | 'session:change' | 'before:render' | MapworksMapFeatureEventType;

///
export interface MapworksEventEmitter<TContext, T> {
  on(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
  off(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
}

/// Helper for the RXJS `fromEvent()` function which recognised MapworksMap events
export function fromEvent<T>(
  target: MapworksEventEmitter<any, T> | ArrayLike<MapworksEventEmitter<any, T>>,
  eventName: MapworksMapEventType
): Observable<T> {
  return rxjsFromEvent(target, eventName);
}

/**
 * An instance of a Mapworks map component.
 */
export declare class MapworksMap {
  /**
   * Return the Mapworks API Url.
   */
  public getServerUrl(): string;

  /**
   * Return the current OAuth2 Access Token.
   */
  public getAccessToken(): string;

  /**
   * Return the current OAuth2 Access Token type, usually `Bearer`.
   */
  public getTokenType(): string;

  /**
   * Returns the authorization scheme type and access token,
   * which may used as the value of the HTTP Authorization header.
   */
  public getAuthorization(): string;

  /**
   * Return the Mapworks API version.
   */
  public getApiVersion(): string;

  ///
  public login(args?: SigninPopupArgs): Promise<MapworksUser>;

  ///
  public loginAnonymous(): Promise<MapworksUser>;

  ///
  public logout(args?: SignoutRedirectArgs): Promise<void>;

  ///
  public getUser(): Promise<MapworksUser>;

  /// Returns true if the map is ready
  public isReady(): boolean;

  ///
  public getControl(controlName: string): MapworksStudioControl;

  ///
  public getTree(): MapworksTreeEntity;

  /// Returns the coordinate reference system of the map.
  public getCrs(): string;

  /// Returns the center location of the current view as a coordinate `[x,y]`.
  public getViewCenter(): number[]

  ///
  public retrieveLayersByReferenceIds(refIds: string[]): Promise<MapworksTreeLayerEntity[]>;

  /// Search a set of layers for features based on a criteria filter.
  public layerSearch(input: MapworksLayerSearchInput): Promise<any>; // XXX TODO : jQuery.jqXHR

  /// Animates the current view to specified x, y coordinates or extents.
  public animateTo(options: MapworksAnimateToOptions): void;

  // XXX TODO WIP

  public on(eventType: 'ready', callback: () => void): MapworksMap;
  public on(eventType: 'accessToken:change', callback: (tokenType: string, accessToken: string) => void): MapworksMap;
  public on(eventType: 'session:change', callback: (user: User) => void): MapworksMap; // XXX TODO Check user param type

  public on(eventType: MapworksMapFeatureEventType, callback: (event: MapworksFeatureEvent) => void): MapworksMap;
  public off(eventType: MapworksMapFeatureEventType, callback: (event: MapworksFeatureEvent) => void): MapworksMap;

  // XXX TODO
  [name: string]: any;
}

///
export interface MapworksStudioConfigOptions {
  mapworksPath: string;

  ///
  access?: MapworksAccess;

  /// The ID of the map to load.
  map?: string;

  /// The reference ID of the map to load. This will be ignored if a map ID is provided.
  mapRef?: string;

  /// XXX TODO
  [name: string]: any;

  ///
  mapworksLoginProvider?: MapworksUserManagerSettings;
}

export enum MapworksAccess {
  /** Start with Anonymous map access and do not provide option to sign in */
  Anonymous = 'anonymous-only',
  /** Start with Anonymous map access AND allow the option to sign in */
  AnonymousOrRegistered = 'anonymous-registered',
  /** Require users to sign in with a registered account only */
  RegisteredOnly = 'registered-only',
}

/**
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.control.BaseControl
 */
export declare class MapworksStudioControl {

  ///
  name: String;

  ///
  public addTo(map: MapworksMap, options?: { index: number }): MapworksStudioControl;
}

/**
 *
 * @see https://da/~juneidy/api/#!/api/Studio.core.control.tooltip.Tooltip
 */
export declare class MapworksStudioTooltipControl extends MapworksStudioControl {

  // XXX TODO Confirm callback operation
  //  * @param {Function} cb Callback used when there is template data that
	//  * requires asynchronous loading. Call this function with the template
	//  * object described above to render the tooltip again with updated
	//  * template.
	//  */
  public on(eventType: 'before:render', callback: (featureOrFeatures: MapworksFeatureEntity, templateObject: MapworksFeatureDisplayTemplates, rerenderCallback: (templateObject: MapworksFeatureDisplayTemplates) => void) => void): void; // XXX TODO "all features"

}


/**
 * The input object to use for {@link Studio.core.Map#layerSearch Layer Search}.
 */
export interface MapworksLayerSearchInput {
  input: {
    /**
     * The result set size.
     * @defaultValue 10
     */
    size?: number;

    /**
     * The starting index (offset).
     * This is used for situations where paging of results is required.
     * @defaultValue 0
     */
    from?: number;

    /**
     * An array of vector layers to search.
     */
    layers: MapworksTreeVectorLayerEntity[];

    /**
     * @property {Studio.core.entity.query.Filter} filter XXX TODO
     * The filter to apply on the layer search.
     */
    filter?: { [n: string]: Json };

    /**
     * The fields to include in the result.
     */
    include: string[];

    /**
     * @property {Studio.core.entity.query.Query} query XXX TODO
     * Query string to search.
     */
    query?: { [n: string]: Json };
  }[];
}


/**
 * Input options for a map animation operation.
 */
export interface MapworksAnimateToOptions {
  /**
	 * The X coordinate to animate to; provide either `(x,y)` or `extent`.
   */
   x?: number;

  /**
	 * The Y coordinate to animate to; provide either `(x,y)` or `extent`.
   */
   y?: number;

  /**
	 * The X coordinate to animate to; provide either `(x,y)` or `extent`.
   */
   extent?: any; // XXX TODO

  ///
  targetScale?: number;

  /**
	 * The multiplier applied to the target scale.
   * @defaultValue 1
   */
  targetScaleMultiplier?: number

  /// The animation style.
  animationStyle?: string;

  /**
   * The maximum duration of the animation in milliseconds,
   * noting that the animation can be shorter if the view
	 * is closer to the destination scale or position.
   * @defaultValue 4000
   */
  duration?: number;

  /*
	 * The function called when complete.
	 */
  callback?: () => void;
}


///
export interface MapworksUserManagerSettings extends UserManagerSettings {
  /**
   * Prefix used for keys in LocalStorage used to store OAuth2/OIDC authorisation state;
   * defaults to the OAuth2 Client ID.
   */
  storage_prefix?: string;

  /**
   * The user email representing the Mapworks Anonymous User (if enabled for the Mapworks Organisation);
   * this is usually `noreply@public-anonymous.mapworks.io`.
   */
  anonymousUser?: string;
}

/**
 * Mapworks user types.
 * @see https://krondor.amristar.com/bitbucket/projects/PPM/repos/mapworks-management-console/browse/src/app/api/models/system-user-type.ts#9
 * @see https://krondor.amristar.com/bitbucket/projects/PPM/repos/org-directory/browse/src/entity/types.ts
 */
export enum MapworksUserType {
  Org = 'org_user',
  Standalone = 'standalone_user',
}

/**
 * Mapworks user roles.
 * @see https://krondor.amristar.com/bitbucket/projects/PPM/repos/mapworks-management-console/browse/src/app/api/models/standalone-user-role.ts
 * @see https://krondor.amristar.com/bitbucket/projects/PPM/repos/mapworks-management-console/browse/src/app/api/models/org-user-role.ts
 * @see https://krondor.amristar.com/bitbucket/projects/PPM/repos/org-directory/browse/src/entity/types.ts
 */
export enum MapworksUserRole {
  AllUsers = 'all_users',
  Anonymous = 'anonymous',
  AppUser = 'app_user',
  FreeUser = 'free_user',
  MapDesigner = 'map_designer',
  MapDesignerIndividual = 'map_designer_individual',
  OrgAdmin = 'org_admin',
  OrgSubscriber = 'org_subscriber',
  SystemAdmin = 'system_admin',
}

///
export interface MapworksUserProfile extends UserProfile {
  /// Mapworks user ID
  'mapworks:id'?: string;

  /// Mapworks username (an email address)
  'mapworks:username'?: string;

  ///
  'mapworks:attributes'?: {
    [name: string]: any;
  };

  /// Mapworks user role
  'mapworks:role'?: MapworksUserRole;

  /// Mapworks user type
  'mapworks:type'?: MapworksUserType;

  /// Mapworks organisation ID (that the user belongs to)
  'mapworks:organisation'?: string;

  /// Mapworks organisation name (that the user belongs to)
  'mapworks:organisation_name'?: string;

  /// Default ACL for this user
  'mapworks:defaultAcl'?: {
    find?: Array<string>;
    read?: Array<string>;
    write?: Array<string>;
    remove?: Array<string>;
  };

  // XXX TODO Confirm
  // profile: "/latest/users/uibKziwgGA8p-vAj7BgwI",
}

///
export interface MapworksUser extends User {
  profile: MapworksUserProfile;
}

///
export declare class MapworksUserManager extends UserManager {
  ///
  constructor(settings?: MapworksUserManagerSettings);

  /**
   * Custom Mapworks method to initialise user auth session by checking if there is an
   * existing session in LocalStorage and performing a session renewal if required.
   */
  public init(): Promise<MapworksUser | null>;

  ///
  public getUserInfo(user: User): Promise<MapworksUserProfile>;

  ///
  public signinPopup(args?: SigninPopupArgs): Promise<MapworksUser>;

  ///
  public getProfile(user: User): Promise<MapworksUser>;
}

/**
 * Once Studio is loaded, the global reference `Studio` of type
 * MapworksStudio is defined.
 */
export declare class MapworksStudio {

  /**
   * Initialise a Mapworks Map component within the specific HTML component.
   *
   * @param elementOrSelector a HTML element selection (string e.g. `#map`) or HTMLElement
   * @param config the Studio Map configuration
   * @param additionalConfig additional web interface configuration
   */
  public init(
    elementOrSelector: string | HTMLElement,
    config: MapworksStudioConfigOptions,
    additionalConfig?: { [n: string]: any }
  ): MapworksMap;

  /// Provide access to Studio's OAuth2 OpenID Connect (OIDC) auth component
  OidcClient: {
    ///
    MapworksUserManager: typeof MapworksUserManager;
    ///
    signinCallback(): void;
  };

  core: {

    entity: {

      TreeVectorLayerEntity: typeof MapworksTreeVectorLayerEntity;

    }

  }

  /// Provide access to Studio's copy of the [Underscore](https://underscorejs.org) library
  _: typeof _;

  /// Provide access to Studio's copy of the [JQuery](https://jquery.com/) library
  $: any; // XXX TODO
}

/**
 * Once Studio is loaded, the global reference `Studio` of type
 * MapworksStudio is defined.
 */
declare global {
  interface Window {
    // map: any;
    Studio: MapworksStudio;
  }
}
