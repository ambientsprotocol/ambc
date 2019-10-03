Execution
  = head:SubExecution tail:(_ ("|") _ SubExecution)+ {
        return {
            type: "Parallel",
            children: tail.reduce((acc, step) => {
              step.map((s) => {
                if(!s.type) return;
                acc.push(s)
              })
              return acc
            }, [head])
        }
    }
    / SubExecution

SubExecution
  = head:ThirdTier tail:((".") ThirdTier)+ {
        return {
            type: "Serial",
            children: tail.reduce((acc, step) => {
              step.map((s) => {
                if (typeof(s) === "string") return;
                acc.push(s)
              })
              return acc
            }, [head])
        }
    }
    / ThirdTier

ThirdTier
  = "(" _ ex:Execution _ ")" { return { type: "Group", children: [ex] }; }
  / AMBIENT
  / PATH

AMBIENT
  = path:PATH "[]" { return { "type": "Ambient", id: path.trim() }; }
  / path:PATH "[" _ ex:Execution _ "]" {
      return { type: "Ambient", id: path.trim(), children: [ex] };
  }

CAPABILITY
  = "in_" id:ID* { return { "type": "In_", id: id[0] ? id[0].trim() : '*' }; }
  / "in " id:ID { return { "type": "In", id: id.trim() }; }
  / "open_" id:ID* { return { "type": "Open_", id: id[0] ? id[0].trim() : '*' }; }
  / "open " id:ID { return { "type": "Open", id: id.trim() }; }
  / "out_ " id:ID* { return { "type": "Out_", id: id[0] ? id[0].trim() : '*' }; }
  / "out " id:ID { return { "type": "Out", id: id.trim() }; }

PATH
  = "nu" _ id:ID { return id; }
  / "rec" _ pv:PROCVAR { return pv; }
  / pv:PROCVAR { return pv; }
  / cap:CAPABILITY { return cap; }
  / id:ID { return id; }

ID "string" = _ [a-zA-Z0-0_\-]+ { return text() }
PROCVAR "string" = [A-Z] { return test() }

_ "whitespace" = [ \t\n\r]*
