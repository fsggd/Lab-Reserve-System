package backend.demo.service;

import backend.demo.common.result.PageResult;
import backend.demo.entity.Instrument;

public interface InstrumentService {

    PageResult<Instrument> list(String name, String status, long pageNum, long pageSize);

    Instrument getById(Long id);

    Long create(Instrument instrument);

    Long update(Long id, Instrument instrument);

    void delete(Long id);
}
