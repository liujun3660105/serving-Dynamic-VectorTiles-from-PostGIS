CREATE 
	OR REPLACE FUNCTION generateTile ( zmin INT,zmax INT, SCHEMA_NAME TEXT, TABLE_NAME TEXT, srid INT = 3857 ) RETURNS TEXT AS $BODY$ DECLARE
	worldMercMax NUMERIC := 20037508.3427892;
worldMercMin NUMERIC :=- worldMercMax;
xTileMin INTEGER;
xTileMax INTEGER;
yTileMin INTEGER;
yTileMax INTEGER;
i INTEGER;
j INTEGER;
K INTEGER;
tile bytea;
rec record;
BEGIN-- EXECUTE format('select gid into xTileMin from schema_name.table_name where gid = 1')-- EXECUTE FORMAT('-- select gid from %I.%I where gid = 1;-- ',schema_name,table_name) into xTileMin;
	i := zmin;
	while
	i <= zmax
	loop--   根据数据范围，得到z值下对应的最小和最大xy
	EXECUTE format ( 'with pt as (
		select st_dumppoints(st_extent(geom)) as pt1 from %I.%I 
		), coorfromextent as(
		select (pt1).geom as geom from pt where (pt1).path[2] in (1,3)
		),xyTile as 
		(select lat2tile(ST_Y(geom),$1) y, lon2tile(ST_X(geom), $1) x from coorfromextent)
  select (ARRAY_AGG(x))[1], (ARRAY_AGG(x))[2], (ARRAY_AGG(y))[1], (ARRAY_AGG(y))[2] from xyTile', SCHEMA_NAME, TABLE_NAME ) USING i INTO xTileMin,
	xTileMax,
	yTileMax,
	yTileMin;
	j := xTileMin;
	while
	j <= xTileMax
	loop
	K := yTileMin;
	while
	K <= yTileMax
	loop
	EXECUTE format ( 'with mvtgeom as (
		select st_asmvtgeom(t.geom,Box2D(TileBBox($1,$2,$3,$4))) as geom from %I.%I t where st_intersects(t.geom,TileBBox($1,$2,$3,$4)))
	insert into public.xyztile(z,x,y,tilefile) select $1,$2,$3,st_asmvt(mvtgeom.*) from mvtgeom', SCHEMA_NAME, TABLE_NAME ) USING i,
	j,
	K,
	srid;
	K := K + 1;
	
END loop;
j := j + 1;

END loop;
i := i + 1;

END loop;
RETURN 'success';
--  query select rec_ctid,gxdldm,gj,ylz,msfs,typeID,geom from filter_result;

END;
$BODY$ LANGUAGE plpgsql VOLATILE STRICT COST 100