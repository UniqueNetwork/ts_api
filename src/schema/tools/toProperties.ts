import {CollectionSchemaUnique, TokenSchemaUnique, UrlOrInfixUrlWithHash} from "../types";
import {
  CollectionProperties,
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";
import {converters} from "../schemaUtils";
import {getKeys} from "../../tsUtils";
import {validateCollectionTokenPropertyPermissions} from "./validators";

export const collectionSchemaToProperties = (schema: CollectionSchemaUnique): CollectionProperties => {
  return converters.objectToProperties(schema)
}

const generateDefaultTPPObjectForKey = (key: string): TokenPropertyPermissionObject => ({
  key,
  permission: {mutable: false, collectionAdmin: true, tokenOwner: false}
})

export interface ICollectionSchemaToTokenPropertyPermissionsOptions {
  overwriteTPPs?: CollectionTokenPropertyPermissions
}

export const collectionSchemaToTokenPropertyPermissions = (schema: CollectionSchemaUnique, options?: ICollectionSchemaToTokenPropertyPermissionsOptions): CollectionTokenPropertyPermissions => {
  const permissions: CollectionTokenPropertyPermissions = [
    generateDefaultTPPObjectForKey('n'), // name
    generateDefaultTPPObjectForKey('d'), // description
    generateDefaultTPPObjectForKey('i'), // image url infix
    generateDefaultTPPObjectForKey('iu'),// image url
    generateDefaultTPPObjectForKey('ih'),// image hash
    generateDefaultTPPObjectForKey('p'), // preview image url infix
    generateDefaultTPPObjectForKey('pu'),// preview image url
    generateDefaultTPPObjectForKey('ph'),// preview image hash
    ...getKeys(schema.attributes).map(key => generateDefaultTPPObjectForKey(`a.${key}`))
  ]

  if (schema.hasOwnProperty('video')) {
    permissions.push(generateDefaultTPPObjectForKey('v'))  // video url infix
    permissions.push(generateDefaultTPPObjectForKey('vu')) // video url
    permissions.push(generateDefaultTPPObjectForKey('vh')) // video hash
  }

  if (schema.hasOwnProperty('audio')) {
    permissions.push(generateDefaultTPPObjectForKey('au'))  // audio url infix
    permissions.push(generateDefaultTPPObjectForKey('auu')) // audio url
    permissions.push(generateDefaultTPPObjectForKey('auh')) // audio hash
  }

  if (schema.hasOwnProperty('object3D')) {
    permissions.push(generateDefaultTPPObjectForKey('3d'))  // 3DObject url infix
    permissions.push(generateDefaultTPPObjectForKey('3du')) // 3DObject url
    permissions.push(generateDefaultTPPObjectForKey('3dh')) // 3DObject hash
  }

  if (options?.overwriteTPPs) {
    const {overwriteTPPs} = options

    if (!validateCollectionTokenPropertyPermissions(overwriteTPPs)) {
      throw new Error(`overwriteTPPs are not valid`)
    }

    for (const tpp of overwriteTPPs) {
      const index = permissions.findIndex(permission => permission.key === tpp.key)
      if (index < 0) {
        permissions.push(tpp)
      } else {
        permissions[index] = tpp
      }
    }
  }

  return permissions
}

const urlInfixObjToObj = (to: any,  prefix: string, source: UrlOrInfixUrlWithHash) => {
  if (typeof source.urlInfix === 'string') {
    to[`${prefix}`] = source.urlInfix
  } else if (typeof source.url === 'string') {
    to[`${prefix}u`] = source.url
  }

  if (typeof source.hash === 'string') {
    to[`${prefix}h`] = source.hash
  }
}

export const tokenToProperties = (token: TokenSchemaUnique) => {
  const obj: any = {}
  if (token.name) obj.n = token.name
  if (token.description) obj.n = token.description
  if (token.attributes) {
    for (const n in token.attributes) {
      const value = token.attributes[n]
      //obj[`a.${n}`] = typeof value === "object" ? JSON.stringify(value) : value
      console.log(value, String(value))
      obj[`a.${n}`] = String(value)
    }
  }

  urlInfixObjToObj(obj, 'i', token.image)

  if (token.imagePreview) urlInfixObjToObj(obj, 'p', token.imagePreview)
  if (token.video) urlInfixObjToObj(obj, 'v', token.video)
  if (token.audio) urlInfixObjToObj(obj, 'au', token.audio)
  if (token.object3D) urlInfixObjToObj(obj, '3d', token.object3D)

  return converters.objectToProperties(obj)
}
