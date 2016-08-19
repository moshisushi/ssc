local redis = require "resty.redis"
local red = redis:new()
red:set_timeout(1000)

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "Failed to connect to local Redis: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    return
end

local word = ngx.var.arg_w

if not word or #word == 0 then
    ngx.exit(ngx.HTTP_BAD_REQUEST)
    return
end

ok, err = red:sadd("words", word)
if not ok then
    ngx.log(ngx.ERR, "Failed to add word to set", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

ok, err = red:zincrby("counters", 1, word)
if not ok then
    ngx.log(ngx.ERR, "Failed to increase word counter", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end
