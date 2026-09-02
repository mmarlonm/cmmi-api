const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/sharepoint/folder
 * @desc    Proxy para consumir SharePoint REST API sin exponer credenciales al browser.
 *          Recibe los parámetros de la carpeta y el Access Token del frontend,
 *          hace la petición server-side a SharePoint y devuelve los Row de ListData.
 *
 * Query Params:
 *   - rootFolder   : Server-relative path de la carpeta (URL encoded)
 *   - siteUrl      : Base URL del sitio SharePoint (ej: https://tenant.sharepoint.com/ProjectCenterOnline/Repositorios...)
 *   - listPath     : Decoded URL del list path (ej: /ProjectCenterOnline/Repositorios.../PMD00222...)
 *   - viewId       : GUID de la view de SharePoint (opcional)
 *   - accessToken  : Bearer token de SharePoint (obtenido desde el JSON .driveAccessToken del frontend)
 */
router.get('/folder', async (req, res) => {
  try {
    const { rootFolder, siteUrl, listPath, viewId, accessToken } = req.query;

    if (!rootFolder || !siteUrl || !listPath) {
      return res.status(400).json({
        error: 'Se requieren los parámetros: rootFolder, siteUrl y listPath.'
      });
    }

    // Construir URL del endpoint REST de SharePoint
    const encodedListPath = encodeURIComponent(`'${listPath}'`);
    const encodedRoot = encodeURIComponent(rootFolder);
    const viewParam = viewId ? `&View=${viewId}` : '';

    const spUrl =
      `${siteUrl}/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream` +
      `?@a1=${encodedListPath}` +
      `&RootFolder=${encodedRoot}` +
      `${viewParam}` +
      `&TryNewExperienceSingle=TRUE`;

    // Headers — reenviamos el Authorization si viene desde el frontend
    const headers = {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Usar cookies si el frontend las reenvía (para autenticación por sesión)
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    const spResponse = await fetch(spUrl, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!spResponse.ok) {
      const errText = await spResponse.text();
      return res.status(spResponse.status).json({
        error: `SharePoint respondió con error ${spResponse.status}`,
        details: errText.substring(0, 500)
      });
    }

    const spData = await spResponse.json();

    // Extraer sólo la parte relevante (ListData.Row) para no exponer tokens internos de SP
    const rows = spData?.ListData?.Row || [];
    const rootFolderParam = spData?.ListData?.FilterLink || '';
    const totalSize = spData?.ListSchema?.TotalSize || 0;
    const itemCount = spData?.ListData?.LastRow || rows.length;

    const sanitizedRows = rows.map(r => ({
      id: r.ID,
      name: r.FileLeafRef || r.Title || '',
      fileRef: r.FileRef || '',
      fsobjType: r.FSObjType, // 1 = folder, 0 = file
      folderChildCount: parseInt(r.FolderChildCount || '0', 10),
      itemChildCount: parseInt(r.ItemChildCount || '0', 10),
      totalSizeBytes: parseInt(r.SMTotalSize || '0', 10),
      modifiedDate: r.Modified || r['Modified.'] || '',
      editorName: Array.isArray(r.Editor) && r.Editor[0] ? r.Editor[0].title : (r.Editor || ''),
      spItemUrl: r['.spItemUrl'] || '',
      uniqueId: r.UniqueId || ''
    }));

    return res.json({
      success: true,
      rows: sanitizedRows,
      totalSize,
      itemCount,
      rootFolderParam
    });
  } catch (error) {
    console.error('[SP Proxy Error]', error.message);
    return res.status(500).json({
      error: 'Error interno al consultar SharePoint.',
      details: error.message
    });
  }
});

module.exports = router;
