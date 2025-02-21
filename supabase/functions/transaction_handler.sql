create or replace function transaction_handler(
  operations jsonb
) returns jsonb language plpgsql security definer as $$
declare
  result jsonb = '[]'::jsonb;
  op jsonb;
  row_result jsonb;
begin
  for op in select * from jsonb_array_elements(operations)
  loop
    case op->>'type'
      when 'create' then
        execute format(
          'insert into %I %s returning to_jsonb(*)',
          op->>'collection',
          (op->>'data')::jsonb::text
        ) into row_result;
        result = result || row_result;
      
      when 'update' then
        execute format(
          'update %I set %s where id = %L returning to_jsonb(*)',
          op->>'collection',
          (op->>'data')::jsonb::text,
          op->>'id'
        ) into row_result;
        result = result || row_result;
      
      when 'delete' then
        execute format(
          'delete from %I where id = %L returning to_jsonb(*)',
          op->>'collection',
          op->>'id'
        ) into row_result;
        result = result || row_result;
    end case;
  end loop;
  
  return result;
exception when others then
  raise exception 'Transaction failed: %', SQLERRM;
end;
$$; 