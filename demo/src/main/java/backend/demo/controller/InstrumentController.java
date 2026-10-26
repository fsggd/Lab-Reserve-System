package backend.demo.controller;

import backend.demo.common.result.PageResult;
import backend.demo.common.result.R;
import backend.demo.entity.Instrument;
import backend.demo.service.InstrumentService;
import backend.demo.vo.IdVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instruments")
@RequiredArgsConstructor
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    public R<PageResult<Instrument>> list(@RequestParam(required = false) String name,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(defaultValue = "1") long pageNum,
                                          @RequestParam(defaultValue = "10") long pageSize) {
        return R.ok(instrumentService.list(name, status, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<Instrument> get(@PathVariable Long id) {
        return R.ok(instrumentService.getById(id));
    }

    @PostMapping
    public R<IdVO> create(@RequestBody Instrument instrument) {
        return R.ok(new IdVO(instrumentService.create(instrument)));
    }

    @PutMapping("/{id}")
    public R<IdVO> update(@PathVariable Long id, @RequestBody Instrument instrument) {
        return R.ok(new IdVO(instrumentService.update(id, instrument)));
    }

    @DeleteMapping("/{id}")
    public R<Boolean> delete(@PathVariable Long id) {
        instrumentService.delete(id);
        return R.ok(true);
    }
}
