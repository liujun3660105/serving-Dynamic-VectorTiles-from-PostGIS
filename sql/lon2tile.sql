--经度转切片x
CREATE OR REPLACE FUNCTION lon2tile(lon DOUBLE PRECISION, zoom INTEGER)
  RETURNS INTEGER AS
$BODY$
    SELECT FLOOR( (lon + 180) / 360 * (1 << zoom) )::INTEGER;
$BODY$
  LANGUAGE SQL IMMUTABLE;