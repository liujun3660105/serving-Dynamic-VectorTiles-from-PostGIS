--xyz转几何
create or replace function TileBBox (z int, x int, y int, srid int = 3857)
    returns geometry
    language plpgsql immutable as
$func$
declare
    max numeric := 20037508.34;
    res numeric := (max*2)/(2^z);
    bbox geometry;
begin
    bbox := ST_MakeEnvelope(
        -max + (x * res),
        max - (y * res),
        -max + (x * res) + res,
        max - (y * res) - res,
        3857
    );
    if srid = 3857 then
        return bbox;
    else
        return ST_Transform(bbox, srid);
    end if;
end;
$func$;

作者：tpolong
链接：https://juejin.im/post/5dc6af03f265da4d4d0cfe13
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。