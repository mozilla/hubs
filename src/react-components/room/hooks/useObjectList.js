import React, { useState, useEffect, useContext, createContext, useCallback, Children, cloneElement } from "react";
import PropTypes from "prop-types";
import { mediaSort, mediaSortAframe, getMediaType, getMediaTypeAframe } from "../../../utils/media-sorting.js";
import { anyEntityWith, shouldUseNewLoader } from "../../../utils/bit-utils";
import { addComponent, defineQuery, hasComponent, removeComponent } from "bitecs";
import { Inspected, MediaInfo } from "../../../bit-components.js";

function getUrl(eid) {
  return hasComponent(APP.world, MediaInfo, eid) ? APP.getString(MediaInfo.accessibleUrl[eid]) : "";
}

function getUrlAframe(el) {
  // Having a listed-media component does not guarantee the existence of a media-loader component,
  // so don't crash if there isn't one.
  return (el.components["media-loader"] && el.components["media-loader"].data.src) || "";
}

function getDisplayString(url) {
  const split = url.split("/");
  const resourceName = split[split.length - 1].split("?")[0];
  let httpIndex = -1;
  for (let i = 0; i < split.length; i++) {
    if (split[i].indexOf("http") !== -1) {
      httpIndex = i;
    }
  }

  let host = "";
  let lessHost = "";
  if (httpIndex !== -1 && split.length > httpIndex + 3) {
    host = split[httpIndex + 2];
    const hostSplit = host.split(".");
    if (hostSplit.length > 1) {
      lessHost = `${hostSplit[hostSplit.length - 2]}.${hostSplit[hostSplit.length - 1]}`;
    }
  }

  const firstPart =
    url.indexOf("sketchfab.com") !== -1 ? "Sketchfab" : url.indexOf("youtube.com") !== -1 ? "YouTube" : lessHost;

  return `${firstPart} ... ${resourceName.substr(0, 4)}`;
}

const ObjectListContext = createContext({
  objects: [],
  focusedObject: null,
  selectedObject: null,
  focusObject: () => {},
  unfocusObject: () => {},
  inspectObject: () => {},
  uninspectObject: () => {}
});

function handleInspect(scene, object, callback) {
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;

  callback(object);

  if (shouldUseNewLoader()) {
    const inspected = anyEntityWith(APP.world, Inspected);
    if (inspected != object.eid) {
      if (inspected) {
        removeComponent(APP.world, Inspected, inspected);
      }
      addComponent(APP.world, Inspected, object.eid);
    }
  } else {
    if (object.el.object3D !== cameraSystem.inspectable) {
      if (cameraSystem.inspectable) {
        cameraSystem.uninspect(false);
      }

      cameraSystem.inspect(object.el.object3D, 1.5, false);
    }
  }
}

function handleDeselect(scene, object, callback) {
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;

  callback(null);

  if (shouldUseNewLoader()) {
    const inspected = anyEntityWith(APP.world, Inspected);
    if (inspected) {
      removeComponent(APP.world, Inspected, inspected);
    }
    if (object) {
      addComponent(APP.world, Inspected, object.eid);
    }
  } else {
    cameraSystem.uninspect(false);

    if (object) {
      cameraSystem.inspect(object.el.object3D, 1.5, false);
    }
  }
}

const queryListedMedia = defineQuery([MediaInfo]);
export function ObjectListProvider({ scene, children }) {
  const [objects, setObjects] = useState([]);
  const [focusedObject, setFocusedObject] = useState(null); // The object currently shown in the viewport
  const [selectedObject, setSelectedObject] = useState(null); // The object currently selected in the object list
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
  const [lightsEnabled, setLightsEnabled] = useState(cameraSystem.lightsEnabled);

  useEffect(() => {
    function updateMediaEntities() {
      if (shouldUseNewLoader()) {
        const objects = queryListedMedia(APP.world)
          .sort(mediaSort)
          .map(eid => ({
            id: APP.world.eid2obj.get(eid)?.id,
            name: getDisplayString(getUrl(eid)),
            type: getMediaType(eid),
            eid: eid
          }));
        setObjects(objects);

        const inspected = anyEntityWith(APP.world, Inspected);
        if (!inspected || !objects.find(o => o.eid === inspected)) {
          setSelectedObject(null);
        }
      } else {
        const objects = scene.systems["listed-media"].els.sort(mediaSortAframe).map(el => ({
          id: el.object3D.id,
          name: getDisplayString(getUrlAframe(el)),
          type: getMediaTypeAframe(el),
          eid: el.eid,
          el
        }));
        setObjects(objects);

        const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
        const inspectedEl = cameraSystem.inspectable && cameraSystem.inspectable.el;

        if (!inspectedEl || !objects.find(o => o.el === inspectedEl)) {
          setSelectedObject(null);
        }
      }
    }

    let timeout;

    function onListedMediaChanged() {
      // HACK: The listed-media component exists before the media-loader component does, in cases where an entity is created from a network template because of an incoming message, so don't updateMediaEntities right away.
      // Sorry in advance for the day this comment is out of date.
      timeout = setTimeout(() => updateMediaEntities(), 0);
    }

    scene.addEventListener("listed_media_changed", onListedMediaChanged);

    updateMediaEntities();

    return () => {
      scene.removeEventListener("listed_media_changed", updateMediaEntities);
      clearTimeout(timeout);
    };
  }, [scene, setObjects, setSelectedObject]);

  useEffect(() => {
    function onInspectTargetChanged() {
      if (shouldUseNewLoader()) {
        const inspected = anyEntityWith(APP.world, Inspected);

        if (inspected) {
          const object = objects.find(o => o.eid === inspected);

          if (object) {
            setSelectedObject(object);
          } else {
            setSelectedObject({
              id: APP.world.eid2obj.get(inspected)?.id,
              name: getDisplayString(getUrl(inspected)),
              type: getMediaType(inspected),
              eid: inspected
            });
          }
        } else {
          setSelectedObject(null);
        }
      } else {
        const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
        const inspectedEl = cameraSystem.inspectable && cameraSystem.inspectable.el;

        if (inspectedEl) {
          const object = objects.find(o => o.el === inspectedEl);

          if (object) {
            setSelectedObject(object);
          } else {
            setSelectedObject({
              id: inspectedEl.object3D.id,
              name: getDisplayString(getUrlAframe(inspectedEl)),
              type: getMediaTypeAframe(inspectedEl),
              eid: inspectedEl.eid,
              el: inspectedEl
            });
          }
        } else {
          setSelectedObject(null);
        }
      }
    }

    scene.addEventListener("inspect-target-changed", onInspectTargetChanged);

    return () => {
      scene.removeEventListener("inspect-target-changed", onInspectTargetChanged);
    };
  }, [scene, setSelectedObject, objects]);

  useEffect(() => {
    function onLightsChanged() {
      const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
      setLightsEnabled(cameraSystem.lightsEnabled);
    }

    scene.addEventListener("inspect-lights-changed", onLightsChanged);

    return () => {
      scene.removeEventListener("inspect-lights-changed", onLightsChanged);
    };
  }, [scene]);

  const selectObject = useCallback(
    object => handleInspect(scene, object, setSelectedObject),
    [scene, setSelectedObject]
  );

  const deselectObject = useCallback(
    () => handleDeselect(scene, focusedObject, setSelectedObject),
    [scene, setSelectedObject, focusedObject]
  );

  const focusObject = useCallback(object => handleInspect(scene, object, setFocusedObject), [scene, setFocusedObject]);

  const unfocusObject = useCallback(
    () => handleDeselect(scene, selectedObject, setFocusedObject),
    [scene, setFocusedObject, selectedObject]
  );

  const selectNextObject = useCallback(() => {
    const curObjIdx = objects.indexOf(selectedObject);

    if (curObjIdx !== -1) {
      const nextObjIdx = (curObjIdx + 1) % objects.length;
      selectObject(objects[nextObjIdx]);
    }
  }, [selectObject, objects, selectedObject]);

  const selectPrevObject = useCallback(() => {
    const curObjIdx = objects.indexOf(selectedObject);

    if (curObjIdx !== -1) {
      const nextObjIdx = curObjIdx === 0 ? objects.length - 1 : curObjIdx - 1;
      selectObject(objects[nextObjIdx]);
    }
  }, [selectObject, objects, selectedObject]);

  const toggleLights = useCallback(() => {
    const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
    cameraSystem.toggleLights();
  }, [scene]);

  const context = {
    objects,
    activeObject: focusedObject || selectedObject,
    focusedObject,
    selectedObject,
    focusObject,
    unfocusObject,
    selectObject,
    deselectObject,
    selectPrevObject,
    selectNextObject,
    toggleLights,
    lightsEnabled
  };

  // Note: If we move ui-root to a functional component and use hooks,
  // we can use the useObjectList hook instead of cloneElement.

  return (
    <ObjectListContext.Provider value={context}>
      {Children.map(children, child => cloneElement(child, { ...context }))}
    </ObjectListContext.Provider>
  );
}

ObjectListProvider.propTypes = {
  scene: PropTypes.object.isRequired,
  children: PropTypes.node
};

export function useObjectList() {
  return useContext(ObjectListContext);
}
