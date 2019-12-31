--纬度转切片y
CREATE OR REPLACE FUNCTION lat2tile(lat double precision, zoom integer)
  RETURNS integer AS
$BODY$
    SELECT floor( (1.0 - ln(tan(radians(lat)) + 1.0 / cos(radians(lat))) / pi()) / 2.0 * (1 << zoom) )::integer;
$BODY$
  LANGUAGE sql IMMUTABLE;